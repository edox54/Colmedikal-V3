import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET todos los doctors
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM doctors');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET un doctor por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM doctors WHERE id = ?', [id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ error: 'Doctor no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear nuevo doctor
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, specialty, city, phone, email, clinic, rating, availability, education, image, cost } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO doctors (id, name, specialty, city, phone, email, clinic, rating, availability, education, image, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, specialty, city, phone, email, clinic, rating, availability, education, image, cost]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar doctor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, specialty, city, phone, email, clinic, rating, availability, education, image, cost, active } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE doctors SET name = ?, specialty = ?, city = ?, phone = ?, email = ?, clinic = ?, rating = ?, availability = ?, education = ?, image = ?, cost = ?, active = ? WHERE id = ?',
      [name, specialty, city, phone, email, clinic, rating, availability, education, image, cost, active, id]
    );
    connection.release();
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE doctor
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM doctors WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Doctor eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
