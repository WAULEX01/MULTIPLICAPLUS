import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, initDb } from './db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // Initialize Database
  await initDb();

  // --- AUTH ROUTES ---
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, role, department } = req.body;
    try {
      const existing: any = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }

      const id = `u${Date.now()}`;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await query(
        'INSERT INTO users (id, name, email, password, role, department) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, hashedPassword, role || 'multiplicador', department || 'Geral']
      );

      res.status(201).json({ message: 'Usuário criado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const users: any = await query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = users[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      // For initial setup, if password is not hashed, we might need a fallback or just hash it once
      // In a real app, you'd have a signup or migration script
      if (!isMatch && password === user.password) {
        // Temporary fallback for plain text passwords during migration
        const hashed = await bcrypt.hash(password, 10);
        await query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
      } else if (!isMatch) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, department: user.department },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ token, user: userWithoutPassword });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro no servidor' });
    }
  });

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Não autorizado' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Token inválido' });
    }
  };

  // --- MEMBERS ROUTES ---
  app.get('/api/members', authenticate, async (req, res) => {
    try {
      const members = await query('SELECT * FROM members');
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar membros' });
    }
  });

  app.post('/api/members', authenticate, async (req, res) => {
    const member = req.body;
    try {
      await query(
        'INSERT INTO members (id, name, email, phone, department, join_date, birth_date, is_baptized, is_new_convert, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [member.id, member.name, member.email, member.phone, member.department, member.joinDate, member.birthDate, member.isBaptized, member.isNewConvert, member.isActive]
      );
      res.status(201).json({ message: 'Membro criado' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar membro' });
    }
  });

  app.put('/api/members/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const fields = Object.keys(updates).map(key => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`).join(', ');
      const values = Object.values(updates);
      await query(`UPDATE members SET ${fields} WHERE id = ?`, [...values, id]);
      res.json({ message: 'Membro atualizado' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar membro' });
    }
  });

  app.delete('/api/members/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    try {
      await query('DELETE FROM members WHERE id = ?', [id]);
      res.json({ message: 'Membro excluído' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao excluir membro' });
    }
  });

  // --- USERS ROUTES ---
  app.get('/api/users', authenticate, async (req, res) => {
    try {
      const users = await query('SELECT id, name, email, role, department FROM users');
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  // --- ATTENDANCE ROUTES ---
  app.get('/api/attendance', authenticate, async (req, res) => {
    try {
      const attendance = await query('SELECT * FROM attendance');
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar presenças' });
    }
  });

  app.post('/api/attendance/batch', authenticate, async (req, res) => {
    const { records } = req.body;
    try {
      for (const record of records) {
        await query(
          'INSERT INTO attendance (id, date, department, member_id, present, service_type) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE present = VALUES(present), service_type = VALUES(service_type)',
          [record.id, record.date, record.department, record.memberId, record.present, record.serviceType]
        );
      }
      res.json({ message: 'Presenças salvas' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao salvar presenças' });
    }
  });

  // --- SETTINGS ROUTES ---
  app.get('/api/settings', async (req, res) => {
    try {
      const settings: any = await query('SELECT * FROM settings WHERE id = "global"');
      res.json(settings[0] || null);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar configurações' });
    }
  });

  app.put('/api/settings', authenticate, async (req, res) => {
    const updates = req.body;
    try {
      const fields = Object.keys(updates).map(key => `${key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} = ?`).join(', ');
      const values = Object.values(updates);
      await query(`INSERT INTO settings (id, ${Object.keys(updates).map(k => k.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`)).join(', ')}) VALUES ("global", ${values.map(() => '?').join(', ')}) ON DUPLICATE KEY UPDATE ${fields}`, [...values, ...values]);
      res.json({ message: 'Configurações atualizadas' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar configurações' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
