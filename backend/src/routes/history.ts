import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

export async function historyRoutes(fastify: FastifyInstance) {
  fastify.get('/api/security/history', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user!.id;

    try {
      const result = await dbPool.query(
        `SELECT id, user_id as "userId", total_score as "totalScore", risk_level as "riskLevel", 
                category_scores as "categoryScores", created_at as "createdAt"
         FROM public.security_assessments
         WHERE user_id = $1::uuid
         ORDER BY created_at ASC`,
        [userId]
      );

      return reply.send({
        history: result.rows,
      });
    } catch (err: any) {
      request.log.error(err, 'History fetch failed from DB.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
