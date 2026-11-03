import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const progressSchema = z.object({
  moduleId: z.string().uuid(),
  completed: z.boolean().default(true),
  score: z.number().min(0).max(100).default(100),
});

export async function trainingRoutes(fastify: FastifyInstance) {
  // Fetch all training modules
  fastify.get('/api/training', async (request, reply) => {
    try {
      const result = await dbPool.query(`
        SELECT id, title, slug, category, summary, content, quiz, estimated_minutes as "estimatedMinutes", created_at as "createdAt"
        FROM public.training_modules
        ORDER BY created_at ASC;
      `);
      return reply.send({ modules: result.rows });
    } catch (err: any) {
      request.log.error(err, 'Training modules fetch failed.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Fetch training progress for current user
  fastify.get('/api/training/progress', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user!.id;
    try {
      const result = await dbPool.query(`
        SELECT module_id as "moduleId", completed, score, completed_at as "completedAt"
        FROM public.training_progress
        WHERE user_id = $1::uuid;
      `, [userId]);

      const progressMap: Record<string, { completed: boolean; score: number; completedAt: string }> = {};
      result.rows.forEach(r => {
        progressMap[r.moduleId] = {
          completed: r.completed,
          score: r.score,
          completedAt: r.completedAt,
        };
      });

      return reply.send({ progress: progressMap });
    } catch (err: any) {
      request.log.error(err, 'Training progress fetch failed.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Save/Update module progress
  fastify.post('/api/training/progress', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = progressSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid progress data format.',
      });
    }

    const { moduleId, completed, score } = parseResult.data;
    const userId = request.user!.id;

    try {
      const result = await dbPool.query(
        `INSERT INTO public.training_progress (user_id, module_id, completed, score, completed_at)
         VALUES ($1::uuid, $2::uuid, $3::boolean, $4::int, $5)
         ON CONFLICT (user_id, module_id)
         DO UPDATE SET completed = EXCLUDED.completed, score = EXCLUDED.score, completed_at = EXCLUDED.completed_at
         RETURNING id, user_id as "userId", module_id as "moduleId", completed, score, completed_at as "completedAt"`,
        [userId, moduleId, completed, score, completed ? new Date().toISOString() : null]
      );

      return reply.send({
        message: 'Training progress saved to database.',
        progress: result.rows[0],
      });
    } catch (err: any) {
      request.log.error(err, 'Training progress update failed in DB.');
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to save training module progress in database.',
      });
    }
  });
}
