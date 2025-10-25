import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'countries_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

try {
  pool = mysql.createPool(dbConfig);
  console.log('Database pool created successfully');
} catch (error) {
  console.error('Error creating database pool:', error);
  process.exit(1);
}

export default pool;
