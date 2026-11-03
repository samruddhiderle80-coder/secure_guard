import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { dbPool } from '../config/db';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.get('/api/security/dashboard', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = request.user!.id;

    try {
      // 1. Fetch latest assessment from DB
      const assessmentRes = await dbPool.query(
        `SELECT id, total_score as "totalScore", risk_level as "riskLevel", 
                category_scores as "categoryScores", created_at as "createdAt"
         FROM public.security_assessments
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      const latestAssessment = assessmentRes.rows[0] || null;

      // 2. Fetch open findings from DB
      const findingsRes = await dbPool.query(
        `SELECT id, severity, title, description, recommendation, created_at as "createdAt"
         FROM public.security_findings
         WHERE user_id = $1::uuid AND resolved = false
         ORDER BY created_at DESC`,
        [userId]
      );

      // 3. Fetch phishing attempts from DB
      const phishingRes = await dbPool.query(
        `SELECT is_correct FROM public.phishing_attempts WHERE user_id = $1::uuid`,
        [userId]
      );
      let phishingScore: number | null = null;
      if (phishingRes.rows.length > 0) {
        const correct = phishingRes.rows.filter(r => r.is_correct).length;
        phishingScore = Math.round((correct / phishingRes.rows.length) * 100);
      }

      // 4. Fetch training progress from DB
      const trainingRes = await dbPool.query(
        `SELECT COUNT(*) FROM public.training_progress WHERE user_id = $1::uuid AND completed = true`,
        [userId]
      );
      const completedTrainingCount = parseInt(trainingRes.rows[0].count, 10);

      // 5. Fetch MFA checklists from DB
      const mfaRes = await dbPool.query(
        `SELECT completed_items FROM public.mfa_checklists WHERE user_id = $1::uuid`,
        [userId]
      );
      let completedMfaChecksCount = 0;
      mfaRes.rows.forEach(r => {
        const items = typeof r.completed_items === 'string' ? JSON.parse(r.completed_items) : r.completed_items;
        if (Array.isArray(items)) {
          completedMfaChecksCount += items.length;
        }
      });

      // 6. Fetch Privacy assessment from DB
      const privacyRes = await dbPool.query(
        `SELECT exposure_score as "exposureScore", exposure_level as "exposureLevel"
         FROM public.privacy_assessments
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC LIMIT 1;`,
        [userId]
      );

      // 7. Fetch Incidents count
      const incidentsRes = await dbPool.query(
        `SELECT COUNT(*) as count FROM public.incidents WHERE user_id = $1::uuid;`,
        [userId]
      );

      // 8. Fetch Recent Security Events from DB
      const eventsRes = await dbPool.query(
        `SELECT id, event_type as "eventType", metadata, created_at as "createdAt"
         FROM public.security_events
         WHERE user_id = $1::uuid
         ORDER BY created_at DESC
         LIMIT 5;`,
        [userId]
      );

      return reply.send({
        hasAssessment: !!latestAssessment,
        latestAssessment,
        securityScore: latestAssessment ? latestAssessment.totalScore : null,
        riskLevel: latestAssessment ? latestAssessment.riskLevel : null,
        categoryScores: latestAssessment ? latestAssessment.categoryScores : null,
        openFindings: findingsRes.rows,
        phishingScore,
        completedTrainingCount,
        completedMfaChecksCount,
        privacyExposure: privacyRes.rows[0] || null,
        totalIncidents: parseInt(incidentsRes.rows[0]?.count || '0', 10),
        recentEvents: eventsRes.rows,
      });
    } catch (err: any) {
      request.log.error(err, 'Dashboard fetch failed from DB.');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
