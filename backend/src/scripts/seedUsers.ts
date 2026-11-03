import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function seedUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  const users = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@socialguard.security',
      password: 'AdminPass2026!',
      fullName: 'System Security Admin',
      role: 'admin'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'user@socialguard.security',
      password: 'SecurityPass2026!',
      fullName: 'Social Security User',
      role: 'user'
    }
  ];

  for (const u of users) {
    // 1. auth.users
    await client.query(`
      INSERT INTO auth.users (
        id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        $1::uuid, 'authenticated', 'authenticated', $2::text, crypt($3::text, gen_salt('bf')), NOW(),
        '{"provider": "email", "providers": ["email"]}'::jsonb,
        json_build_object('full_name', $4::text, 'role', $5::text),
        NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        encrypted_password = crypt($3::text, gen_salt('bf')),
        raw_user_meta_data = json_build_object('full_name', $4::text, 'role', $5::text),
        updated_at = NOW();
    `, [u.id, u.email, u.password, u.fullName, u.role]);

    // 2. public.profiles
    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1::uuid, $2::text, $3::text, $4::text)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();
    `, [u.id, u.email, u.fullName, u.role]);

    // 3. public.user_roles
    await client.query(`
      INSERT INTO public.user_roles (user_id, role)
      VALUES ($1::uuid, $2::text)
      ON CONFLICT (user_id, role) DO NOTHING;
    `, [u.id, u.role]);

    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  // Verify
  const res = await client.query(`SELECT id, email, full_name, role FROM public.profiles;`);
  console.log('Profiles verified:', res.rows);

  await client.end();
}

seedUsers().catch(console.error);
