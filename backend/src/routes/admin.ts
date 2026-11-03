import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth';
import { dbPool } from '../config/db';

const updateIncidentStatusSchema = z.object({
  status: z.enum(['PENDING', 'UNDER_REVIEW', 'RESOLVED']),
});

export async function adminRoutes(fastify: FastifyInstance) {
  // 1. Overall System Analytics
  fastify.get('/api/admin/analytics', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      // 1. Total profiles count
      const usersRes = await dbPool.query('SELECT COUNT(*) FROM public.profiles;');
      const totalUsers = parseInt(usersRes.rows[0].count, 10);

      // 2. Assessments summary & average
      const assessmentsRes = await dbPool.query('SELECT total_score, risk_level, category_scores FROM public.security_assessments;');
      const assessments = assessmentsRes.rows;
      const totalAssessments = assessments.length;
      let averageScore = 0;
      const riskDistribution = { LOW: 0, MODERATE: 0, HIGH: 0, CRITICAL: 0 };
      const categoryAverages = {
        password: 0, mfa: 0, privacy: 0, phishing: 0, applications: 0, recovery: 0, awareness: 0
      };

      if (totalAssessments > 0) {
        let sumScore = 0;
        assessments.forEach(a => {
          sumScore += a.total_score;
          if (a.risk_level in riskDistribution) {
            riskDistribution[a.risk_level as keyof typeof riskDistribution]++;
          }
          if (a.category_scores) {
            const catScores = typeof a.category_scores === 'string' ? JSON.parse(a.category_scores) : a.category_scores;
            Object.keys(categoryAverages).forEach(k => {
              const catKey = k as keyof typeof categoryAverages;
              categoryAverages[catKey] += (catScores[catKey] || 0);
            });
          }
        });
        averageScore = Math.round(sumScore / totalAssessments);
        Object.keys(categoryAverages).forEach(k => {
          const catKey = k as keyof typeof categoryAverages;
          categoryAverages[catKey] = Math.round(categoryAverages[catKey] / totalAssessments);
        });
      }

      // 3. Incidents summary
      const incidentsRes = await dbPool.query('SELECT incident_type as "incidentType", status, severity FROM public.incidents;');
      const totalIncidents = incidentsRes.rows.length;

      // 4. Phishing attempts
      const phishingRes = await dbPool.query('SELECT is_correct FROM public.phishing_attempts;');
      const totalPhishingAttempts = phishingRes.rows.length;
      const phishingCorrect = phishingRes.rows.filter(p => p.is_correct).length;
      const phishingSuccessRate = totalPhishingAttempts > 0 ? Math.round((phishingCorrect / totalPhishingAttempts) * 100) : 0;

      // 5. Training completion count
      const trainingRes = await dbPool.query('SELECT COUNT(*) FROM public.training_progress WHERE completed = true;');
      const trainingCompletions = parseInt(trainingRes.rows[0].count, 10);

      // 6. Feedback ratings
      const feedbackRes = await dbPool.query('SELECT rating, ease_of_use as "easeOfUse", usefulness as "usefulness", would_recommend as "wouldRecommend", comments FROM public.feedback;');
      const feedbackItems = feedbackRes.rows;
      const totalFeedback = feedbackItems.length;
      let avgRating = 0;
      if (totalFeedback > 0) {
        avgRating = Number((feedbackItems.reduce((acc, f) => acc + f.rating, 0) / totalFeedback).toFixed(1));
      }

      return reply.send({
        metrics: {
          totalUsers,
          totalAssessments,
          averageScore,
          totalIncidents,
          phishingTestsCompleted: totalPhishingAttempts,
          phishingSuccessRate,
          trainingCompletions,
          totalFeedback,
          avgRating,
        },
        distributions: {
          riskLevel: riskDistribution,
          categoryAverages,
        },
        incidents: incidentsRes.rows,
        feedback: feedbackItems,
      });
    } catch (err: any) {
      request.log.error(err, 'Admin analytics processing error.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // 2. Incident Management for Admins (with User Profile Data)
  fastify.get('/api/admin/incidents', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const res = await dbPool.query(`
        SELECT i.id, i.user_id as "userId", p.email as "userEmail", p.full_name as "userName",
               i.platform, i.incident_type as "incidentType", i.description, i.incident_date as "incidentDate",
               i.access_lost as "accessLost", i.credentials_shared as "credentialsShared",
               i.financial_loss as "financialLoss", i.severity, i.status, i.created_at as "createdAt"
        FROM public.incidents i
        LEFT JOIN public.profiles p ON p.id = i.user_id
        ORDER BY i.created_at DESC;
      `);
      return reply.send({ incidents: res.rows });
    } catch (err: any) {
      request.log.error(err, 'Admin incidents fetch failed.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // 3. Update Incident Status in Database
  fastify.patch('/api/admin/incidents/:id/status', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = updateIncidentStatusSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Invalid status.' });
    }

    try {
      const res = await dbPool.query(
        `UPDATE public.incidents
         SET status = $1
         WHERE id = $2::uuid
         RETURNING id, status;`,
        [parse.data.status, id]
      );

      if (res.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'Incident not found.' });
      }

      return reply.send({ message: 'Incident status updated in database.', incident: res.rows[0] });
    } catch (err: any) {
      request.log.error(err, 'Incident status update failed.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // 4. List All Users from Database
  fastify.get('/api/admin/users', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const res = await dbPool.query(`
        SELECT p.id, p.email, p.full_name as "fullName", p.role, p.created_at as "createdAt"
        FROM public.profiles p
        ORDER BY p.created_at DESC;
      `);
      return reply.send({ users: res.rows });
    } catch (err: any) {
      request.log.error(err, 'Admin users fetch failed.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // 5. Content Registry Summary from Database
  fastify.get('/api/admin/content-summary', { preHandler: [requireAdmin] }, async (request, reply) => {
    try {
      const qCountRes = await dbPool.query('SELECT COUNT(*) FROM public.assessment_questions;');
      const pCountRes = await dbPool.query('SELECT COUNT(*) FROM public.phishing_scenarios;');
      const tCountRes = await dbPool.query('SELECT COUNT(*) FROM public.training_modules;');

      return reply.send({
        assessmentQuestionsCount: parseInt(qCountRes.rows[0].count, 10),
        phishingScenariosCount: parseInt(pCountRes.rows[0].count, 10),
        trainingModulesCount: parseInt(tCountRes.rows[0].count, 10),
      });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
