import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { dbPool } from '../config/db';
import { signJwt } from '../config/jwt';
import { authenticate } from '../middleware/auth';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  fullName: z.string().min(1, 'Full name is required.'),
  role: z.enum(['user', 'admin']).default('user'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Full name cannot be blank.'),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Signup Endpoint
  fastify.post('/api/auth/signup', async (request, reply) => {
    const parse = signupSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parse.error.errors[0]?.message || 'Invalid input data.',
      });
    }

    const { email, password, fullName, role } = parse.data;

    try {
      // Check if email already registered
      const existing = await dbPool.query(
        'SELECT id FROM auth.users WHERE LOWER(email) = LOWER($1::text);',
        [email]
      );

      if (existing.rows.length > 0) {
        return reply.status(400).send({
          error: 'Registration Error',
          message: 'An account with this email address already exists. Please log in.',
        });
      }

      // Generate UUID
      const uuidRes = await dbPool.query('SELECT gen_random_uuid() as id;');
      const newUserId = uuidRes.rows[0].id;

      // 1. Insert into auth.users with pgcrypto crypt
      await dbPool.query(`
        INSERT INTO auth.users (
          id, aud, role, email, encrypted_password, email_confirmed_at,
          raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
          $1::uuid, 'authenticated', 'authenticated', $2::text, crypt($3::text, gen_salt('bf')), NOW(),
          '{"provider": "email", "providers": ["email"]}'::jsonb,
          json_build_object('full_name', $4::text, 'role', $5::text),
          NOW(), NOW()
        );
      `, [newUserId, email, password, fullName, role]);

      // 2. Insert into public.profiles
      await dbPool.query(`
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES ($1::uuid, $2::text, $3::text, $4::text)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          updated_at = NOW();
      `, [newUserId, email, fullName, role]);

      // 3. Insert into public.user_roles
      await dbPool.query(`
        INSERT INTO public.user_roles (user_id, role)
        VALUES ($1::uuid, $2::text)
        ON CONFLICT (user_id, role) DO NOTHING;
      `, [newUserId, role]);

      const user = {
        id: newUserId,
        email,
        full_name: fullName,
        role: role as 'user' | 'admin',
      };

      const token = signJwt({ id: user.id, email: user.email, role: user.role });

      // Log security event
      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'AUTH_SIGNUP', jsonb_build_object('email', $2::text, 'role', $3::text));`,
          [newUserId, email, role]
        );
      } catch (evErr) {}

      return reply.status(201).send({
        message: 'Account created successfully in database.',
        user,
        token,
      });
    } catch (err: any) {
      request.log.error(err, 'Signup failed');
      return reply.status(500).send({
        error: 'Database Error',
        message: err.message || 'Failed to create user account.',
      });
    }
  });

  // Login Endpoint
  fastify.post('/api/auth/login', async (request, reply) => {
    const parse = loginSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parse.error.errors[0]?.message || 'Email and password are required.',
      });
    }

    const { email, password } = parse.data;

    try {
      const res = await dbPool.query(`
        SELECT u.id, u.email, p.full_name, COALESCE(p.role, 'user') as role
        FROM auth.users u
        LEFT JOIN public.profiles p ON p.id = u.id
        WHERE LOWER(u.email) = LOWER($1::text)
          AND u.encrypted_password = crypt($2::text, u.encrypted_password);
      `, [email, password]);

      if (res.rows.length === 0) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid email or password. Please verify your credentials.',
        });
      }

      const row = res.rows[0];
      const user = {
        id: row.id,
        email: row.email,
        full_name: row.full_name || row.email.split('@')[0],
        role: (row.role === 'admin' ? 'admin' : 'user') as 'user' | 'admin',
      };

      const token = signJwt({ id: user.id, email: user.email, role: user.role });

      // Log security event
      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'AUTH_LOGIN', jsonb_build_object('email', $2::text));`,
          [user.id, user.email]
        );
      } catch (evErr) {}

      return reply.send({
        message: 'Logged in successfully.',
        user,
        token,
      });
    } catch (err: any) {
      request.log.error(err, 'Login query failed');
      return reply.status(500).send({
        error: 'Database Error',
        message: err.message || 'Authentication query failed.',
      });
    }
  });

  // Me / Session check Endpoint
  fastify.get('/api/auth/me', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const res = await dbPool.query(
        `SELECT id, email, full_name, role, created_at, updated_at 
         FROM public.profiles 
         WHERE id = $1::uuid;`,
        [request.user?.id]
      );

      if (res.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'User profile not found.' });
      }

      const profile = res.rows[0];
      return reply.send({
        user: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
        },
      });
    } catch (err: any) {
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Update Profile Endpoint
  fastify.put('/api/auth/profile', { preHandler: [authenticate] }, async (request, reply) => {
    const parse = updateProfileSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parse.error.errors[0]?.message || 'Invalid full name.',
      });
    }

    const { fullName } = parse.data;
    const userId = request.user!.id;

    try {
      const res = await dbPool.query(
        `UPDATE public.profiles
         SET full_name = $1, updated_at = NOW()
         WHERE id = $2::uuid
         RETURNING id, email, full_name as "fullName", role;`,
        [fullName, userId]
      );

      if (res.rows.length === 0) {
        return reply.status(404).send({ error: 'Not Found', message: 'User profile not found.' });
      }

      await dbPool.query(
        `UPDATE auth.users
         SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', $1::text), updated_at = NOW()
         WHERE id = $2::uuid;`,
        [fullName, userId]
      );

      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'PROFILE_UPDATED', jsonb_build_object('fullName', $2::text));`,
          [userId, fullName]
        );
      } catch (evErr) {}

      return reply.send({
        message: 'Profile updated successfully in database.',
        user: {
          id: res.rows[0].id,
          email: res.rows[0].email,
          full_name: res.rows[0].fullName,
          role: res.rows[0].role,
        },
      });
    } catch (err: any) {
      request.log.error(err, 'Profile update failed');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });

  // Change Password Endpoint
  fastify.post('/api/auth/change-password', { preHandler: [authenticate] }, async (request, reply) => {
    const parse = changePasswordSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: parse.error.errors[0]?.message || 'Invalid input data.',
      });
    }

    const { currentPassword, newPassword } = parse.data;
    const userId = request.user!.id;

    try {
      const verifyRes = await dbPool.query(
        `SELECT id FROM auth.users WHERE id = $1::uuid AND encrypted_password = crypt($2::text, encrypted_password);`,
        [userId, currentPassword]
      );

      if (verifyRes.rows.length === 0) {
        return reply.status(400).send({
          error: 'Verification Failed',
          message: 'The current password you entered is incorrect.',
        });
      }

      await dbPool.query(
        `UPDATE auth.users 
         SET encrypted_password = crypt($1::text, gen_salt('bf')), updated_at = NOW()
         WHERE id = $2::uuid;`,
        [newPassword, userId]
      );

      try {
        await dbPool.query(
          `INSERT INTO public.security_events (user_id, event_type, metadata)
           VALUES ($1::uuid, 'PASSWORD_CHANGED', '{"reason": "user_initiated"}'::jsonb);`,
          [userId]
        );
      } catch (evErr) {}

      return reply.send({ message: 'Password updated successfully in database.' });
    } catch (err: any) {
      request.log.error(err, 'Password update failed');
      return reply.status(500).send({ error: 'Database Error', message: err.message });
    }
  });
}
