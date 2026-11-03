import { FastifyRequest, FastifyReply } from 'fastify';
import { dbPool } from '../config/db';
import { verifyJwt } from '../config/jwt';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication token is required.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyJwt(token);

  if (!payload || !payload.id) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired authentication session.' });
  }

  try {
    const res = await dbPool.query(
      `SELECT p.id, p.email, p.role 
       FROM public.profiles p 
       WHERE p.id = $1::uuid`,
      [payload.id]
    );

    if (res.rows.length === 0) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User profile not found in database.' });
    }

    const row = res.rows[0];
    request.user = {
      id: row.id,
      email: row.email,
      role: row.role === 'admin' ? 'admin' : 'user',
    };
  } catch (err: any) {
    request.log.error(err, 'Failed to authenticate user against database');
    return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication check failed.' });
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await authenticate(request, reply);
  if (reply.sent) return;

  if (request.user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden', message: 'Administrative access permissions required.' });
  }
}
