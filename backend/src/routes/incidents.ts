import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

const incidentCreateSchema = z.object({
  platform: z.string().min(1, 'Platform is required.'),
  incidentType: z.enum([
    'PHISHING', 'ACCOUNT_TAKEOVER', 'FAKE_PROFILE', 'MALICIOUS_LINK', 
    'SCAM', 'IMPERSONATION', 'PRIVACY_EXPOSURE', 'SUSPICIOUS_LOGIN', 'HARASSMENT', 'OTHER'
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  incidentDate: z.string().min(1, 'Incident date is required.'),
  accessLost: z.boolean().default(false),
  credentialsShared: z.boolean().default(false),
  financialLoss: z.boolean().default(false),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
});

export async function incidentRoutes(fastify: FastifyInstance) {
  // Submit new incident to database
  fastify.post('/api/incidents', { preHandler: [authenticate] }, async (request, reply) => {
    const parseResult = incidentCreateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid incident report submission.',
        details: parseResult.error.format(),
      });
    }

    const data = parseResult.data;
    const userId = request.user!.id;

    try {
      const result = await dbPool.query(
        `INSERT INTO public.incidents 
         (user_id, platform, incident_type, description, incident_date, access_lost, credentials_shared, financial_loss, severity, status)
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
         RETURNING id, user_id as "userId", platform, incident_type as "incidentType", description, 
                   incident_date as "incidentDate", access_lost as "accessLost", credentials_shared as "credentialsShared", 
                   financial_loss as "financialLoss", severity, status, created_at as "createdAt"`,
        [userId, data.platform, data.incidentType, data.description, data.incidentDate, data.accessLost, data.credentialsShared, data.financialLoss, data.severity]
      );

      const incident = result.rows[0];

      // Record security event
      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'INCIDENT_REPORTED', jsonb_build_object('incidentId', $2::text, 'platform', $3::text, 'severity', $4::text));`,
          [userId, incident.id, data.platform, data.severity]
        );
      } catch (evErr) {}

      return reply.status(201).send({
        message: 'Incident report submitted successfully to database.',
        incident,
      });
    } catch (err: any) {
      request.log.error(err, 'Incident insert failed.');
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Could not record security incident report in database.',
        detail: err.message,
      });
    }
  });

  // Get incidents for logged-in user from database
  fastify.get('/api/incidents', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user!.id;

    try {
      const result = await dbPool.query(
        `SELECT id, user_id as "userId", platform, incident_type as "incidentType", description, 
                incident_date as "incidentDate", access_lost as "accessLost", credentials_shared as "credentialsShared", 
                financial_loss as "financialLoss", severity, status, created_at as "createdAt"
         FROM public.incidents
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC`,
        [userId]
      );

      return reply.send({ incidents: result.rows });
    } catch (err: any) {
      request.log.error(err, 'Incidents fetch failed from DB.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
