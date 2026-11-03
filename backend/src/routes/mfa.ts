import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const saveMfaSchema = z.object({
  platform: z.string().min(1),
  completedItems: z.array(z.string()),
});

export async function mfaRoutes(fastify: FastifyInstance) {
  // Get MFA checklist items for a platform
  fastify.get('/api/mfa/:platform', { preHandler: [authenticate] }, async (request, reply) => {
    const { platform } = request.params as { platform: string };
    const userId = request.user?.id;

    try {
      const res = await dbPool.query(
        `SELECT completed_items as "completedItems", last_updated as "lastUpdated"
         FROM public.mfa_checklists
         WHERE user_id = $1::uuid AND LOWER(platform) = LOWER($2::text);`,
        [userId, platform]
      );

      const completedItems = res.rows.length > 0 ? res.rows[0].completedItems : [];
      return reply.send({ platform, completedItems });
    } catch (err: any) {
      request.log.error(err, 'Failed to fetch MFA checklist');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Save/Update MFA checklist items
  fastify.post('/api/mfa', { preHandler: [authenticate] }, async (request, reply) => {
    const parse = saveMfaSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({ error: 'Validation Error', message: 'Invalid payload.' });
    }

    const { platform, completedItems } = parse.data;
    const userId = request.user?.id;

    try {
      const res = await dbPool.query(
        `INSERT INTO public.mfa_checklists (user_id, platform, completed_items, last_updated)
         VALUES ($1::uuid, $2::text, $3::jsonb, NOW())
         ON CONFLICT (user_id, platform)
         DO UPDATE SET completed_items = EXCLUDED.completed_items, last_updated = NOW()
         RETURNING platform, completed_items as "completedItems", last_updated as "lastUpdated";`,
        [userId, platform, JSON.stringify(completedItems)]
      );

      return reply.send({
        message: 'MFA checklist updated in database.',
        data: res.rows[0],
      });
    } catch (err: any) {
      request.log.error(err, 'Failed to save MFA checklist');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
