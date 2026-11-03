import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.iniwdkkyyqiukedriiho:AMpmzVNFC4XjsZ7p@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function runMigrationAndSeed() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL database!');

    // 1. Read and execute Schema
    const schemaPath = path.resolve(__dirname, '../../../supabase/migrations/001_initial_schema.sql');
    console.log(`Reading schema file from: ${schemaPath}`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema creation...');
    await client.query(schemaSql);
    console.log('Schema migration completed successfully!');

    // 2. Read and execute Seed
    const seedPath = path.resolve(__dirname, '../../../supabase/seed.sql');
    console.log(`Reading seed file from: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('Executing database seed script...');
    await client.query(seedSql);
    console.log('Database seeding completed successfully!');

    // 3. Verify inserted data count
    const resQuestions = await client.query('SELECT COUNT(*) FROM public.assessment_questions;');
    const resPhishing = await client.query('SELECT COUNT(*) FROM public.phishing_scenarios;');
    const resModules = await client.query('SELECT COUNT(*) FROM public.training_modules;');

    console.log('Verification Results:');
    console.log(`- Assessment Questions in DB: ${resQuestions.rows[0].count}`);
    console.log(`- Phishing Scenarios in DB: ${resPhishing.rows[0].count}`);
    console.log(`- Training Modules in DB: ${resModules.rows[0].count}`);

  } catch (error) {
    console.error('Migration/Seeding Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrationAndSeed();
