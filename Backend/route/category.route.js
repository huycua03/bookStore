import express from 'express';
import { 
    getCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from '../controller/category.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/category', getCategories);
router.get('/category/:id', getCategoryById);
router.post('/category', verifyToken, verifyAdmin, createCategory);
router.put('/category/:id', verifyToken, verifyAdmin, updateCategory);
router.delete('/category/:id', verifyToken, verifyAdmin, deleteCategory);

export default router;
