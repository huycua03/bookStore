import express from 'express';
import { createBook, getBooks, updateBook, deleteBook, getBookById, upload } from '../controller/book.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// API để xử lý sách
router.post('/book', verifyToken, verifyAdmin, upload.single('image'), createBook);
router.get('/book', getBooks);
router.get('/book/:id', getBookById);
router.put('/book/:id', verifyToken, verifyAdmin, upload.single('image'), updateBook);
router.delete('/book/:id', verifyToken, verifyAdmin, deleteBook);

export default router;
