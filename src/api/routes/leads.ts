import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM leads ORDER BY timestamp DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { quoteData, estimatedPrice } = req.body;
    const id = uuidv4();
    const timestamp = new Date();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO leads (id, timestamp, quoteData, estimatedPrice, status) VALUES (?, ?, ?, ?, ?)',
      [id, timestamp, JSON.stringify(quoteData), estimatedPrice, 'Nuevo Plan']
    );
    connection.release();
    res.status(201).json({ id, timestamp, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const connection = await pool.getConnection();
    await connection.query('UPDATE leads SET status = ? WHERE id = ?', [status, id]);
    connection.release();
    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
