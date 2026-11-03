import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const savePrivacySchema = z.object({
  exposureScore: z.number().min(0).max(100),
  exposureLevel: z.enum(['LOW', 'MODERATE', 'HIGH']),
  details: z.record(z.any()),
});

export async function privacyRoutes(fastify: FastifyInstance) {
  // Get latest privacy self-assessment for authenticated user
  fastify.get('/api/privacy', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user?.id;

    try {
      const res = await dbPool.query(
        `SELECT id, exposure_score as "exposureScore", exposure_level as "exposureLevel", details, created_at as "createdAt"
         FROM public.privacy_assessments
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC
         LIMIT 1;`,
        [userId]
      );

      return reply.send({ assessment: res.rows[0] || null });
    } catch (err: any) {
      request.log.error(err, 'Failed to fetch privacy assessment');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Save new privacy self-assessment to database
  fastify.post('/api/privacy', { preHandler: [authenticate] }, async (request, reply) => {
    const parse = savePrivacySchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Invalid privacy payload.' });
    }

    const { exposureScore, exposureLevel, details } = parse.data;
    const userId = request.user?.id;

    try {
      const res = await dbPool.query(
        `INSERT INTO public.privacy_assessments (user_id, exposure_score, exposure_level, details)
         VALUES ($1::uuid, $2, $3, $4::jsonb)
         RETURNING id, exposure_score as "exposureScore", exposure_level as "exposureLevel", details, created_at as "createdAt";`,
        [userId, exposureScore, exposureLevel, JSON.stringify(details)]
      );

      return reply.status(201).send({
        message: 'Privacy assessment saved in database.',
        assessment: res.rows[0],
      });
    } catch (err: any) {
      request.log.error(err, 'Failed to save privacy assessment');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
