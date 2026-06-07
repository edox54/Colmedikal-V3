import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM authorizations ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { patient, proc_name, facility, requestDate, status } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO authorizations (id, patient, proc_name, facility, requestDate, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, patient, proc_name, facility, requestDate, status]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;
    const connection = await pool.getConnection();
    await connection.query('UPDATE authorizations SET status = ?, adminComment = ? WHERE id = ?', [status, adminComment, id]);
    connection.release();
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
