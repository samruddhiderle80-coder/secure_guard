import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  easeOfUse: z.number().min(1).max(5),
  usefulness: z.number().min(1).max(5),
  mostUsefulFeature: z.string().optional().default(''),
  wouldRecommend: z.boolean().default(true),
  comments: z.string().optional().default(''),
});

export async function feedbackRoutes(fastify: FastifyInstance) {
  fastify.post('/api/feedback', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = feedbackSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid feedback form values.',
        details: parseResult.error.format(),
      });
    }

    const data = parseResult.data;
    const userId = request.user!.id;

    try {
      const result = await dbPool.query(
        `INSERT INTO public.feedback
         (user_id, rating, ease_of_use, usefulness, most_useful_feature, would_recommend, comments)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id as "userId", rating, ease_of_use as "easeOfUse", usefulness, 
                   most_useful_feature as "mostUsefulFeature", would_recommend as "wouldRecommend", 
                   comments, created_at as "createdAt"`,
        [userId, data.rating, data.easeOfUse, data.usefulness, data.mostUsefulFeature, data.wouldRecommend, data.comments]
      );

      return reply.status(201).send({
        message: 'Thank you for your feedback! Your response has been recorded in the database.',
        feedback: result.rows[0],
      });
    } catch (err: any) {
      request.log.error(err, 'Feedback submit failed in DB.');
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to record feedback response into database.',
      });
    }
  });

  fastify.get('/api/feedback', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const result = await dbPool.query(
        `SELECT f.id, f.user_id as "userId", p.full_name as "userName", f.rating, 
                f.ease_of_use as "easeOfUse", f.usefulness, f.most_useful_feature as "mostUsefulFeature", 
                f.would_recommend as "wouldRecommend", f.comments, f.created_at as "createdAt"
         FROM public.feedback f
         LEFT JOIN public.profiles p ON p.id = f.user_id
         ORDER BY f.created_at DESC`
      );
      return reply.send({ feedback: result.rows });
    } catch (err: any) {
      request.log.error(err, 'Feedback fetch failed from DB.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
