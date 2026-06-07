import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM appointments ORDER BY aptDate DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { doctorName, specialty, patientName, patientId, patientPhone, aptDate, aptTime, modality, clinic, city, cost } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO appointments (id, doctorName, specialty, patientName, patientId, patientPhone, aptDate, aptTime, modality, clinic, city, cost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, doctorName, specialty, patientName, patientId, patientPhone, aptDate, aptTime, modality, clinic, city, cost, 'Pendiente']
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
    const { status } = req.body;
    const connection = await pool.getConnection();
    await connection.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
    connection.release();
    res.json({ id, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
