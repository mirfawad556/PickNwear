const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Anooshah%402007@db.brtkhqdwnelsgdzjfggc.supabase.co:5432/postgres'
});

async function test() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT NOW()');
    console.log("Time:", res.rows[0]);
    await client.end();
  } catch(e) {
    console.error("Connection failed:", e.message);
  }
}
test();
