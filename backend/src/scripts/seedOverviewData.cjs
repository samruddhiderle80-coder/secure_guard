const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log('Connecting to database to seed Overview data...');
  const client = await pool.connect();

  try {
    // 1. Get all profiles
    const profilesRes = await client.query('SELECT id, email, full_name FROM public.profiles;');
    console.log(`Found ${profilesRes.rows.length} profiles in database:`);
    for (const p of profilesRes.rows) {
      console.log(`- ${p.email} (${p.id})`);
    }

    // 2. Fetch training modules & phishing scenarios to reference their valid UUIDs
    const modulesRes = await client.query('SELECT id, title FROM public.training_modules;');
    const scenariosRes = await client.query('SELECT id, title, correct_option_id FROM public.phishing_scenarios;');

    for (const user of profilesRes.rows) {
      console.log(`\n--- Seeding Overview data for ${user.email} ---`);

      // A. Seed Historical Assessments (so trend chart and latest overview have rich data)
      // Historical 1: 14 days ago (Score 55)
      await client.query(`
        INSERT INTO public.security_assessments (user_id, total_score, risk_level, category_scores, created_at)
        VALUES ($1::uuid, 55, 'HIGH', $2::jsonb, NOW() - INTERVAL '14 days');
      `, [
        user.id,
        JSON.stringify({ password: 50, mfa: 40, privacy: 50, phishing: 60, applications: 60, recovery: 70, awareness: 60 })
      ]);

      // Historical 2: 7 days ago (Score 68)
      await client.query(`
        INSERT INTO public.security_assessments (user_id, total_score, risk_level, category_scores, created_at)
        VALUES ($1::uuid, 68, 'MODERATE', $2::jsonb, NOW() - INTERVAL '7 days');
      `, [
        user.id,
        JSON.stringify({ password: 75, mfa: 60, privacy: 60, phishing: 70, applications: 75, recovery: 75, awareness: 80 })
      ]);

      // Latest Assessment: Today (Score 82)
      const latestAssessmentRes = await client.query(`
        INSERT INTO public.security_assessments (user_id, total_score, risk_level, category_scores, created_at)
        VALUES ($1::uuid, 82, 'LOW', $2::jsonb, NOW())
        RETURNING id;
      `, [
        user.id,
        JSON.stringify({ password: 90, mfa: 85, privacy: 75, phishing: 80, applications: 80, recovery: 85, awareness: 85 })
      ]);
      const assessmentId = latestAssessmentRes.rows[0].id;

      // B. Seed Actionable Findings
      // Remove any old findings for clean state
      await client.query(`DELETE FROM public.security_findings WHERE user_id = $1::uuid;`, [user.id]);

      await client.query(`
        INSERT INTO public.security_findings (assessment_id, user_id, severity, title, description, recommendation, resolved, created_at)
        VALUES 
          ($1::uuid, $2::uuid, 'HIGH', 'SMS Two-Factor Authentication in Use', 'SMS verification codes are susceptible to SIM swapping and cellular interception.', 'Switch to an Authenticator App (Google Authenticator, 1Password) or hardware FIDO2 key.', false, NOW() - INTERVAL '2 days'),
          ($1::uuid, $2::uuid, 'MEDIUM', 'Public Birthday & Contact Visibility', 'Publicly accessible birthdate and email details on social profiles enable targeted OSINT social engineering.', 'Set profile privacy visibility to Friends Only or Only Me for personal dates and phone numbers.', false, NOW() - INTERVAL '1 days'),
          ($1::uuid, $2::uuid, 'LOW', 'Unverified OAuth Applications', 'Third-party connected apps have not been audited in over 90 days.', 'Review and revoke unused app permissions in your account Connected Apps settings.', false, NOW());
      `, [assessmentId, user.id]);

      // C. Seed Phishing Attempts (2 correct, 1 missed = 67% accuracy)
      await client.query(`DELETE FROM public.phishing_attempts WHERE user_id = $1::uuid;`, [user.id]);
      if (scenariosRes.rows.length >= 2) {
        // Attempt 1: Correct
        await client.query(`
          INSERT INTO public.phishing_attempts (user_id, scenario_id, selected_option_id, is_correct, created_at)
          VALUES ($1::uuid, $2::uuid, $3::text, true, NOW() - INTERVAL '3 days');
        `, [user.id, scenariosRes.rows[0].id, scenariosRes.rows[0].correct_option_id]);

        // Attempt 2: Incorrect
        await client.query(`
          INSERT INTO public.phishing_attempts (user_id, scenario_id, selected_option_id, is_correct, created_at)
          VALUES ($1::uuid, $2::uuid, 'wrong-opt', false, NOW() - INTERVAL '2 days');
        `, [user.id, scenariosRes.rows[1].id]);

        // Attempt 3 (if exists): Correct
        if (scenariosRes.rows[2]) {
          await client.query(`
            INSERT INTO public.phishing_attempts (user_id, scenario_id, selected_option_id, is_correct, created_at)
            VALUES ($1::uuid, $2::uuid, $3::text, true, NOW() - INTERVAL '1 days');
          `, [user.id, scenariosRes.rows[2].id, scenariosRes.rows[2].correct_option_id]);
        }
      }

      // D. Seed Training Progress
      await client.query(`DELETE FROM public.training_progress WHERE user_id = $1::uuid;`, [user.id]);
      if (modulesRes.rows.length >= 2) {
        await client.query(`
          INSERT INTO public.training_progress (user_id, module_id, completed, score, completed_at)
          VALUES 
            ($1::uuid, $2::uuid, true, 100, NOW() - INTERVAL '4 days'),
            ($1::uuid, $3::uuid, true, 90, NOW() - INTERVAL '2 days');
        `, [user.id, modulesRes.rows[0].id, modulesRes.rows[1].id]);
      }

      // E. Seed MFA Checklists
      await client.query(`
        INSERT INTO public.mfa_checklists (user_id, platform, completed_items, last_updated)
        VALUES 
          ($1::uuid, 'Instagram', '["mfa_enabled", "backup_codes", "login_alerts"]'::jsonb, NOW()),
          ($1::uuid, 'Facebook', '["mfa_enabled", "session_audit"]'::jsonb, NOW()),
          ($1::uuid, 'WhatsApp', '["mfa_enabled"]'::jsonb, NOW())
        ON CONFLICT (user_id, platform) DO UPDATE SET
          completed_items = EXCLUDED.completed_items,
          last_updated = NOW();
      `, [user.id]);

      // F. Seed Privacy Assessment
      await client.query(`
        INSERT INTO public.privacy_assessments (user_id, exposure_score, exposure_level, details, created_at)
        VALUES ($1::uuid, 82, 'LOW', '{"phonePublic": false, "emailPublic": false, "birthdayPublic": false, "locationGeotagged": false, "friendsPublic": true, "oldPostsPublic": false, "bioPersonalDetails": false}'::jsonb, NOW());
      `, [user.id]);

      // G. Seed Incident Report
      await client.query(`
        INSERT INTO public.incidents (user_id, platform, incident_type, description, incident_date, access_lost, credentials_shared, financial_loss, severity, status, created_at)
        VALUES ($1::uuid, 'Instagram', 'PHISHING', 'Suspicious DM received claiming urgent copyright violation with link to meta-support-appeal-center.net', NOW()::date, false, false, false, 'HIGH', 'UNDER_REVIEW', NOW() - INTERVAL '1 days');
      `, [user.id]);

      // H. Seed Security Events for Activity Feed
      await client.query(`
        INSERT INTO public.security_events (user_id, event_type, metadata, created_at)
        VALUES 
          ($1::uuid, 'ASSESSMENT_COMPLETED', '{"score": 82, "riskLevel": "LOW"}'::jsonb, NOW()),
          ($1::uuid, 'PHISHING_LAB_COMPLETED', '{"accuracy": 67, "passed": true}'::jsonb, NOW() - INTERVAL '1 hours'),
          ($1::uuid, 'TRAINING_MODULE_COMPLETED', '{"module": "Password Security Best Practices"}'::jsonb, NOW() - INTERVAL '5 hours'),
          ($1::uuid, 'MFA_CHECKLIST_VERIFIED', '{"platform": "Instagram", "checksCompleted": 3}'::jsonb, NOW() - INTERVAL '1 days'),
          ($1::uuid, 'AUTH_LOGIN', '{"device": "Chrome Desktop (Windows)"}'::jsonb, NOW() - INTERVAL '2 days');
      `, [user.id]);

      console.log(`Seeded Overview data successfully for ${user.email}!`);
    }

    console.log('\nAll user accounts populated with comprehensive Overview metrics!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

