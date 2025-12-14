import express from 'express';
import { 
    createPayment, 
    getPayments, 
    updatePaymentStatus,
    createVnPayPayment,
    vnpayCallback,
    vnpayIpn
} from '../controller/payment.controller.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// API để xử lý thanh toán
router.post('/payment', verifyToken, createPayment);
router.post('/payment/vnpay/create', verifyToken, createVnPayPayment);
router.get('/payment/vnpay/callback', vnpayCallback); // Public route for VnPay ReturnURL callback
router.post('/payment/vnpay/ipn', vnpayIpn); // Public route for VnPay IPN (Instant Payment Notification)
router.get('/payment/vnpay/ipn', vnpayIpn); // Also support GET for IPN (some VNPAY versions use GET)
router.get('/payments', verifyToken, verifyAdmin, getPayments);
router.put('/payment/:id', verifyToken, verifyAdmin, updatePaymentStatus);

export default router;
