import { Router, Request, Response } from 'express';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET todos los refunds
router.get('/', async (req: Request, res: Response) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM refunds ORDER BY created_at DESC');
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET un refund por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM refunds WHERE id = ?', [id]);
    connection.release();
    if (rows.length === 0) return res.status(404).json({ error: 'Refund no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear nuevo refund
router.post('/', async (req: Request, res: Response) => {
  try {
    const { familyMember, specialty, amount, refundDate, status, invoiceNumber, adminComment, fileName, fileData, userEmail, userPhone } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      'INSERT INTO refunds (id, familyMember, specialty, amount, refundDate, status, invoiceNumber, adminComment, fileName, fileData, userEmail, userPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, familyMember, specialty, amount, refundDate, status, invoiceNumber, adminComment, fileName, fileData, userEmail, userPhone]
    );
    connection.release();
    res.status(201).json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT actualizar refund
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { familyMember, specialty, amount, refundDate, status, invoiceNumber, adminComment, fileName, fileData, userEmail, userPhone } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE refunds SET familyMember = ?, specialty = ?, amount = ?, refundDate = ?, status = ?, invoiceNumber = ?, adminComment = ?, fileName = ?, fileData = ?, userEmail = ?, userPhone = ? WHERE id = ?',
      [familyMember, specialty, amount, refundDate, status, invoiceNumber, adminComment, fileName, fileData, userEmail, userPhone, id]
    );
    connection.release();
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE refund
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM refunds WHERE id = ?', [id]);
    connection.release();
    res.json({ message: 'Refund eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
