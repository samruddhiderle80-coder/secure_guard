import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { calculateRiskAssessment, RawAnswerInput } from '../services/riskEngine';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const answerSchema = z.object({
  questionId: z.string(),
  optionId: z.string().optional().nullable(),
  category: z.enum(['password', 'mfa', 'privacy', 'phishing', 'applications', 'recovery', 'awareness']),
  scoreEarned: z.number().min(0).max(100),
  riskIndicator: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'NONE']).optional().nullable(),
  findingTitle: z.string().optional().nullable(),
  findingRecommendation: z.string().optional().nullable(),
  questionText: z.string().optional().nullable(),
});

const calculateSchema = z.object({
  answers: z.array(answerSchema).min(1, 'At least one answer must be submitted.'),
});

export async function assessmentRoutes(fastify: FastifyInstance) {
  // Fetch questions and options directly from PostgreSQL
  fastify.get('/api/assessment/questions', async (request, reply) => {
    try {
      const questionsRes = await dbPool.query(`
        SELECT id, category, question_text as "questionText", explanation, weight, order_index
        FROM public.assessment_questions
        ORDER BY order_index ASC;
      `);

      const optionsRes = await dbPool.query(`
        SELECT id, question_id as "questionId", option_text as "optionText", score_value as "scoreValue", 
               risk_indicator as "riskIndicator", finding_title as "findingTitle", finding_recommendation as "findingRecommendation"
        FROM public.assessment_options;
      `);

      const optionsByQuestion: Record<string, any[]> = {};
      for (const opt of optionsRes.rows) {
        if (!optionsByQuestion[opt.questionId]) {
          optionsByQuestion[opt.questionId] = [];
        }
        optionsByQuestion[opt.questionId].push({
          id: opt.id,
          text: opt.optionText,
          scoreValue: opt.scoreValue,
          score: opt.scoreValue,
          riskIndicator: opt.riskIndicator,
          findingTitle: opt.findingTitle,
          findingRecommendation: opt.findingRecommendation
        });
      }

      const questions = questionsRes.rows.map(q => ({
        ...q,
        options: optionsByQuestion[q.id] || []
      }));

      return reply.send({ questions });
    } catch (err: any) {
      request.log.error(err, 'Failed to fetch assessment questions from DB');
      return reply.status(500).send({ error: 'Database error', message: err.message });
    }
  });

  // Fetch assessment by ID from PostgreSQL
  fastify.get('/api/assessment/results/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const userId = request.user!.id;

    try {
      let assessmentQuery = `
        SELECT id, total_score as "score", risk_level as "riskLevel", category_scores as "categoryScores", created_at as "createdAt"
        FROM public.security_assessments
        WHERE user_id = $1::uuid
      `;
      const queryParams: any[] = [userId];

      if (id && id !== 'latest') {
        assessmentQuery += ` AND id = $2::uuid`;
        queryParams.push(id);
      } else {
        assessmentQuery += ` ORDER BY created_at DESC LIMIT 1`;
      }

      const assessmentRes = await dbPool.query(assessmentQuery, queryParams);
      if (assessmentRes.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'Assessment record not found.' });
      }

      const assessment = assessmentRes.rows[0];

      // Fetch findings
      const findingsRes = await dbPool.query(
        `SELECT id, severity, title, description, recommendation, resolved
         FROM public.security_findings
         WHERE assessment_id = $1::uuid;`,
        [assessment.id]
      );

      return reply.send({
        ...assessment,
        findings: findingsRes.rows,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Persist calculation & findings into PostgreSQL
  fastify.post('/api/assessment/calculate', { preHandler: [authenticate] }, async (request, reply) => {
    const bodyResult = calculateSchema.safeParse(request.body);
    if (!bodyResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid assessment answers structure.',
        details: bodyResult.error.format(),
      });
    }

    const { answers } = bodyResult.data;
    const calculation = calculateRiskAssessment(answers as RawAnswerInput[]);
    const userId = request.user!.id;

    try {
      const insertAssessmentRes = await dbPool.query(
        `INSERT INTO public.security_assessments (user_id, total_score, risk_level, category_scores)
         VALUES ($1::uuid, $2, $3, $4::jsonb) 
         RETURNING id, created_at as "createdAt"`,
        [userId, calculation.totalScore, calculation.riskLevel, JSON.stringify(calculation.categoryScores)]
      );

      const assessmentId = insertAssessmentRes.rows[0].id;
      const createdAt = insertAssessmentRes.rows[0].createdAt;

      for (const f of calculation.findings) {
        await dbPool.query(
          `INSERT INTO public.security_findings (assessment_id, user_id, severity, title, description, recommendation)
           VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6)`,
          [assessmentId, userId, f.severity, f.title, f.description, f.recommendation]
        );
      }

      // Persist individual assessment answers
      for (const a of answers) {
        if (a.optionId) {
          try {
            await dbPool.query(
              `INSERT INTO public.assessment_answers (assessment_id, question_id, option_id, score_earned)
               VALUES ($1::uuid, $2::uuid, $3::uuid, $4)`,
              [assessmentId, a.questionId, a.optionId, a.scoreEarned]
            );
          } catch (ansErr) {
            request.log.warn({ ansErr }, 'Could not persist answer');
          }
        }
      }

      // Record security event
      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'ASSESSMENT_COMPLETED', $2::jsonb)`,
          [userId, JSON.stringify({ assessmentId, score: calculation.totalScore, riskLevel: calculation.riskLevel })]
        );
      } catch (evErr) {
        request.log.warn({ evErr }, 'Could not record security event');
      }

      return reply.status(201).send({
        id: assessmentId,
        score: calculation.totalScore,
        riskLevel: calculation.riskLevel,
        categoryScores: calculation.categoryScores,
        findings: calculation.findings,
        summaryText: calculation.summaryText,
        createdAt,
      });
    } catch (err: any) {
      request.log.error(err, 'Failed to persist assessment in database');
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to record assessment into database.',
        detail: err.message,
      });
    }
  });
}
