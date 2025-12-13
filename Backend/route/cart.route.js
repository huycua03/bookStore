import express from 'express';
import { 
    getCart, 
    addToCart, 
    updateCartItem, 
    removeFromCart,
    clearCart 
} from '../controller/cart.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.get('/cart', verifyToken, getCart);
router.post('/cart', verifyToken, addToCart);
router.put('/cart', verifyToken, updateCartItem);
router.delete('/cart/:bookId', verifyToken, removeFromCart);
router.delete('/cart', verifyToken, clearCart);

export default router;








