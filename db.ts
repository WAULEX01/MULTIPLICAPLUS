import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let isMockMode = false;

const MOCK_DEPARTMENTS = [
  'Jovens', 'Adolescentes', 'Crianças em oração', 'Novos convertidos', 'Homens', 'Mulheres'
];

export async function query(sql: string, params?: any[]) {
  if (isMockMode) {
    console.warn('DB in Mock Mode - Query skipped:', sql);
    
    // Fallback for login query
    if (sql.includes('SELECT * FROM users WHERE email = ?')) {
      const email = params?.[0];
      return [{
        id: 'admin-preview',
        name: 'Pastor (Preview)',
        email: email || 'waulex2014@gmail.com',
        password: '1234',
        role: 'pastor',
        department: 'Geral'
      }];
    }

    // Fallback for members query
    if (sql.includes('SELECT * FROM members')) {
      return MOCK_DEPARTMENTS.flatMap((dept, deptIdx) => 
        Array.from({ length: 40 }).map((_, i) => ({
          id: `mem-${deptIdx}-${i + 1}`,
          name: `Membro ${i + 1} (${dept})`,
          phone: `119${Math.floor(Math.random() * 90000000 + 10000000)}`,
          birth_date: '1990-01-01',
          department: dept,
          is_new_convert: i % 5 === 0,
          is_baptized: i % 2 === 0,
          is_active: 1,
          join_date: '2024-01-01'
        }))
      );
    }

    // Fallback for users query (leaders and multipliers)
    if (sql.includes('SELECT id, name, email, role, department FROM users')) {
      return MOCK_DEPARTMENTS.flatMap((dept, deptIdx) => [
        ...Array.from({ length: 2 }).map((_, i) => ({
          id: `l-${deptIdx}-${i + 1}`,
          name: `Líder ${i + 1} (${dept})`,
          email: `lider${i + 1}.${deptIdx}@igreja.com`,
          role: 'lider',
          department: dept
        })),
        ...Array.from({ length: 4 }).map((_, i) => ({
          id: `m-${deptIdx}-${i + 1}`,
          name: `Multiplicador ${i + 1} (${dept})`,
          email: `multi${i + 1}.${deptIdx}@igreja.com`,
          role: 'multiplicador',
          department: dept
        }))
      ]);
    }
    
    return [];
  }

  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    return [];
  }
}

export async function initDb() {
  // Check if we have enough info to even try connecting
  if (!process.env.DB_HOST || !process.env.DB_NAME || process.env.DB_HOST === 'localhost') {
    console.warn('Database configuration missing or set to localhost. Entering Mock Mode for preview.');
    isMockMode = true;
    return;
  }

  try {
    // Test connection first with a timeout
    const connection = await pool.getConnection();
    connection.release();
    
    console.log('Database connection successful. Initializing tables...');
    isMockMode = false;
    
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('pastor', 'lider', 'multiplicador', 'secretaria') NOT NULL,
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Members table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        department VARCHAR(100),
        join_date DATE,
        birth_date DATE,
        is_baptized BOOLEAN DEFAULT FALSE,
        is_new_convert BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Departments table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        leader VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Attendance table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(50) PRIMARY KEY,
        date DATE NOT NULL,
        department VARCHAR(100) NOT NULL,
        member_id VARCHAR(50) NOT NULL,
        present BOOLEAN NOT NULL,
        service_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);

    // Meetings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255),
        department VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(50) PRIMARY KEY,
        church_name VARCHAR(255),
        logo_url TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default pool;
