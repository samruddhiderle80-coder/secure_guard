import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { analyzeUrl } from '../services/urlAnalyzer';

const urlAnalyzeSchema = z.object({
  url: z.string().min(1, 'URL parameter is required.').max(2048, 'URL exceeds maximum allowable length.'),
});

export async function urlRoutes(fastify: FastifyInstance) {
  fastify.post('/api/url/analyze', async (request, reply) => {
    const parseResult = urlAnalyzeSchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid request',
        message: 'The submitted URL format is invalid. Please enter a valid URL.',
      });
    }

    try {
      const result = analyzeUrl(parseResult.data.url);
      return reply.send(result);
    } catch (err: any) {
      return reply.status(400).send({
        error: 'Analysis Error',
        message: err?.message || 'Failed to process target URL.',
      });
    }
  });
}
