import {readFileSync} from 'node:fs';
import {pool} from './db.js';
try { await pool.query(readFileSync(new URL('../sql/schema.sql',import.meta.url),'utf8')); console.log('Schema ready'); } finally { await pool.end(); }
