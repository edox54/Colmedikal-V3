import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, email, name, role, addedAt, active FROM admins WHERE active = true');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, role, addedBy } = req.body;
    const id = uuidv4();
    const addedAt = new Date();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO admins (id, email, name, role, addedAt, addedBy, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, email, name, role, addedAt, addedBy, true]
    );
    connection.release();
    res.status(201).json({ id, email, name, role, addedAt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('UPDATE admins SET active = false WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Admin desactivado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
