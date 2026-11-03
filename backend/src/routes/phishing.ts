import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const attemptSchema = z.object({
  scenarioId: z.string().uuid(),
  selectedOptionId: z.string().min(1),
});

export async function phishingRoutes(fastify: FastifyInstance) {
  fastify.get('/api/phishing/scenarios', async (request, reply) => {
    try {
      const result = await dbPool.query(`
        SELECT id, title, context_type as "contextType", message_sender as "messageSender", 
               message_content as "messageContent", option_choices as "optionChoices", 
               correct_option_id as "correctOptionId", explanation, difficulty, created_at as "createdAt"
        FROM public.phishing_scenarios
        ORDER BY created_at ASC;
      `);
      return reply.send({ scenarios: result.rows });
    } catch (err: any) {
      request.log.error(err, 'Phishing scenarios fetch failed from DB.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  fastify.post('/api/phishing/attempt', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = attemptSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid scenario attempt payload.',
      });
    }

    const { scenarioId, selectedOptionId } = parseResult.data;
    const userId = request.user!.id;

    try {
      const scenarioRes = await dbPool.query(
        `SELECT id, correct_option_id as "correctOptionId", explanation FROM public.phishing_scenarios WHERE id = $1::uuid`,
        [scenarioId]
      );

      if (scenarioRes.rows.length === 0) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Target phishing scenario was not found.',
        });
      }

      const scenario = scenarioRes.rows[0];
      const isCorrect = scenario.correctOptionId === selectedOptionId;

      await dbPool.query(
        `INSERT INTO public.phishing_attempts (user_id, scenario_id, selected_option_id, is_correct)
         VALUES ($1::uuid, $2::uuid, $3::text, $4::boolean)`,
        [userId, scenarioId, selectedOptionId, isCorrect]
      );

      // Record security event
      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'PHISHING_ATTEMPT', jsonb_build_object('scenarioId', $2::text, 'isCorrect', $3::boolean));`,
          [userId, scenarioId, isCorrect]
        );
      } catch (evErr) {}

      return reply.send({
        scenarioId,
        selectedOptionId,
        isCorrect,
        correctOptionId: scenario.correctOptionId,
        explanation: scenario.explanation,
      });
    } catch (err: any) {
      request.log.error(err, 'Phishing attempt processing failed.');
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Could not record scenario attempt in database.',
      });
    }
  });
}
