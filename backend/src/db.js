import 'dotenv/config';
import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');
export const pool = new pg.Pool({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:true}:undefined,max:10});
export const q=(sql,params=[])=>pool.query(sql,params);
