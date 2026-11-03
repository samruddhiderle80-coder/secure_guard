import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error);

  if (error.validation) {
    return reply.status(400).send({
      error: 'Invalid Request',
      message: error.message || 'Submitted parameters failed validation checks.',
    });
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'An unexpected server error occurred. Please try again.' : error.message;

  return reply.status(statusCode).send({
    error: error.name || 'API Error',
    message,
  });
}
