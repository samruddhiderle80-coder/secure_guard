import { Pool } from 'pg';
import { env } from './env';

export const dbPool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

dbPool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});
