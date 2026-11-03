import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().default('postgresql://postgres.iniwdkkyyqiukedriiho:AMpmzVNFC4XjsZ7p@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres'),
  SUPABASE_URL: z.string().default('https://iniwdkkyyqiukedriiho.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('dummy_service_role_key'),
  THREAT_INTELLIGENCE_API_KEY: z.string().optional().default(''),
  NODE_ENV: z.string().default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
