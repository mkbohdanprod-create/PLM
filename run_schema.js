import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres:Rpbrgb1357*B@db.speygkpiuimxiujtykmj.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function run() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    
    console.log('Reading schema file...');
    const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
    
    console.log('Executing schema...');
    await client.query(sql);
    
    console.log('Schema executed successfully!');
  } catch (err) {
    console.error('Error executing schema:', err);
  } finally {
    await client.end();
  }
}

run();
