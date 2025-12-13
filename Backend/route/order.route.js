import express from 'express';
import { 
    createOrder, 
    getOrders,
    getMyOrders, 
    getOrderById, 
    updateOrderStatus, 
    deleteOrder 
} from '../controller/order.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/order', verifyToken, createOrder);
router.get('/order', verifyToken, verifyAdmin, getOrders);
router.get('/order/my/list', verifyToken, getMyOrders); // User's own orders
router.get('/order/:id', verifyToken, getOrderById);
router.put('/order/:id', verifyToken, verifyAdmin, updateOrderStatus);
router.delete('/order/:id', verifyToken, verifyAdmin, deleteOrder);

export default router;
