import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { config } from './config.js';

const { Pool } = pg;
export const pool = new Pool(config.databaseUrl
  ? { connectionString: config.databaseUrl }
  : {
      host: process.env.PGHOST || 'postgres',
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || 'taskflow_user',
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE || 'taskflow'
    });

export async function waitForDatabase() {
  for (let attempt = 1; attempt <= 30; attempt++) {
    try {
      await pool.query('SELECT 1');
      const schema = await readFile(new URL('../db/init.sql', import.meta.url), 'utf8');
      await pool.query(schema);
      console.log('PostgreSQL connection established');
      return;
    } catch (error) {
      console.log(`Waiting for PostgreSQL (${attempt}/30): ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  throw new Error('Could not connect to PostgreSQL after 30 attempts');
}
