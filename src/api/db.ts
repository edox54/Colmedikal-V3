import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: 'localhost',
  user: 'colmedikal_admin',
  password: process.env.DB_PASSWORD || '',
  database: 'colmedikal_colmedikal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
