import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js";
import { createPaymentUrl, verifyPaymentCallback } from "../services/vnpayService.js";

// Tạo thanh toán mới
export const createPayment = async (req, res) => {
    try {
        const { orderId, paymentMethod, amount } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const newPayment = new Payment({
            order: orderId,
            paymentMethod,
            amount,
            status: "Pending"
        });

        await newPayment.save();
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo VnPay payment URL
export const createVnPayPayment = async (req, res) => {
    try {
        const { orderId, amount, orderInfo, bankCode } = req.body;
        
        // Get client IP address
        const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                      req.ip || 
                      '127.0.0.1';

        // Validate inputs
        if (!orderId || !amount) {
            return res.status(400).json({ message: "Order ID and amount are required" });
        }

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Use order._id as transaction reference (must be unique string)
        // VnPay requires vnp_TxnRef to be unique and max 100 characters
        const vnp_TxnRef = orderId.toString().substring(0, 100);

        // Check if payment already exists
        let payment = await Payment.findOne({ order: orderId, paymentMethod: 'VnPay' });
        
        if (!payment) {
            // Create new payment record
            payment = new Payment({
                order: orderId,
                paymentMethod: 'VnPay',
                amount: parseFloat(amount),
                status: 'Pending',
                vnp_TxnRef: vnp_TxnRef
            });
            await payment.save();
        }

        // Generate VnPay payment URL
        const paymentUrl = createPaymentUrl({
            amount: parseFloat(amount),
            orderId: vnp_TxnRef,
            orderInfo: orderInfo || `Thanh toan don hang #${orderId}`,
            ipAddr: ipAddr,
            bankCode: bankCode || null
        });

        console.log('VnPay Payment URL created:', {
            orderId: vnp_TxnRef,
            amount: amount,
            ipAddr: ipAddr
        });

        res.status(200).json({
            paymentUrl: paymentUrl,
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Error creating VnPay payment:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// VnPay callback handler
export const vnpayCallback = async (req, res) => {
    try {
        const vnp_Params = req.query;
        const result = verifyPaymentCallback(vnp_Params);

        if (!result.isValid) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}`);
        }

        // Find payment by order ID
        const payment = await Payment.findOne({ 
            vnp_TxnRef: result.orderId,
            paymentMethod: 'VnPay'
        });

        if (!payment) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent('Không tìm thấy giao dịch')}`);
        }

        // Update payment status
        if (result.isSuccess) {
            payment.status = 'Paid';
            payment.vnp_TransactionNo = result.transactionNo;
            payment.vnp_BankCode = result.bankCode;
            payment.vnp_ResponseCode = result.responseCode;
            payment.vnp_PayDate = result.payDate;
            payment.paymentDate = new Date();

            // Update order status
            const order = await Order.findById(payment.order);
            if (order) {
                order.status = 'Processing';
                await order.save();
            }
        } else {
            payment.status = 'Failed';
            payment.vnp_ResponseCode = result.responseCode;
        }

        await payment.save();

        // Redirect to frontend
        if (result.isSuccess) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${result.orderId}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}`);
        }
    } catch (error) {
        console.error('Error handling VnPay callback:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent('Có lỗi xảy ra')}`);
    }
};

// Lấy danh sách thanh toán
export const getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate('order');
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái thanh toán
export const updatePaymentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const payment = await Payment.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
        res.status(200).json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
