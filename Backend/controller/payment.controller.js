import Payment from "../model/payment.model.js";
import Order from "../model/order.model.js";
import Book from "../model/book.model.js";
import { createPaymentUrl, verifyPaymentCallback } from "../services/vnpayService.js";

// Helper function to decrease book stock when payment is successful
const decreaseBookStock = async (order) => {
    try {
        if (!order || !order.items || !Array.isArray(order.items)) {
            console.error('Invalid order data for stock decrease');
            return;
        }

        // Check if stock has already been decreased (to avoid double decrease)
        // We'll use a flag in the order to track this
        if (order.stockDecreased) {
            console.log('Stock already decreased for order:', order._id);
            return;
        }

        console.log('Decreasing stock for order:', order._id);
        
        // Process each item in the order
        for (const item of order.items) {
            try {
                // Find book by _id (item._id is the book ID)
                const book = await Book.findById(item._id);
                
                if (!book) {
                    console.error(`Book not found: ${item._id}`);
                    continue;
                }

                // Check if enough stock
                if (book.stock < item.quantity) {
                    console.error(`Insufficient stock for book ${book._id}: requested ${item.quantity}, available ${book.stock}`);
                    continue;
                }

                // Decrease stock
                book.stock -= item.quantity;
                await book.save();
                
                console.log(`Stock decreased for book ${book._id}: ${item.quantity} units, remaining: ${book.stock}`);
            } catch (itemError) {
                console.error(`Error decreasing stock for item ${item._id}:`, itemError);
            }
        }

        // Mark order as stock decreased to prevent double processing
        order.stockDecreased = true;
        await order.save();
        console.log('Stock decrease completed for order:', order._id);
    } catch (error) {
        console.error('Error in decreaseBookStock:', error);
        throw error;
    }
};

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
        const customer = req.user; // Get customer from authenticated user
        
        console.log('Creating VnPay payment:', {
            orderId,
            amount,
            customerId: customer?._id,
            orderInfo,
            bankCode
        });
        
        // Get client IP address
        const ipAddr = req.headers['x-forwarded-for']?.split(',')[0] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                      req.ip || 
                      '127.0.0.1';

        // Validate inputs
        if (!orderId || !amount) {
            console.error('Missing required fields:', { orderId, amount });
            return res.status(400).json({ message: "Order ID and amount are required" });
        }

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            console.error('Order not found:', orderId);
            return res.status(404).json({ message: "Order not found" });
        }

        console.log('Order found:', {
            orderId: order._id,
            customer: order.customer,
            total: order.total,
            status: order.status
        });

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
            console.log('Payment created:', {
                paymentId: payment._id,
                orderId: payment.order,
                vnp_TxnRef: payment.vnp_TxnRef,
                amount: payment.amount
            });
        } else {
            console.log('Payment already exists:', {
                paymentId: payment._id,
                orderId: payment.order,
                vnp_TxnRef: payment.vnp_TxnRef
            });
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
            ipAddr: ipAddr,
            paymentUrl: paymentUrl.substring(0, 100) + '...'
        });

        res.status(200).json({
            paymentUrl: paymentUrl,
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Error creating VnPay payment:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// VnPay IPN (Instant Payment Notification) handler
// This endpoint receives POST/GET requests from VNPAY to notify payment results
// According to VNPAY docs, this is required for transactions to appear in the transaction list
// IPN URL must be configured in VNPAY sandbox dashboard: https://sandbox.vnpayment.vn/vnpaygw-sit-testing/
export const vnpayIpn = async (req, res) => {
    try {
        // VNPAY sends IPN via POST or GET
        // For GET: params are in query string
        // For POST: params can be in query string or URL-encoded body
        let vnp_Params = {};
        
        // Merge query and body parameters (VNPAY may send in either)
        vnp_Params = { ...req.query, ...req.body };
        
        // Remove empty values
        Object.keys(vnp_Params).forEach(key => {
            if (vnp_Params[key] === '' || vnp_Params[key] === undefined) {
                delete vnp_Params[key];
            }
        });
        
        // If no parameters, return error
        if (Object.keys(vnp_Params).length === 0) {
            console.error('IPN received with no parameters');
            console.error('Request method:', req.method);
            console.error('Request query:', req.query);
            console.error('Request body:', req.body);
            return res.status(200).json({ RspCode: '99', Message: 'No parameters received' });
        }

        console.log('VNPAY IPN received:', {
            vnp_TxnRef: vnp_Params.vnp_TxnRef,
            vnp_ResponseCode: vnp_Params.vnp_ResponseCode,
            vnp_TransactionStatus: vnp_Params.vnp_TransactionStatus,
            vnp_Amount: vnp_Params.vnp_Amount
        });

        const result = verifyPaymentCallback(vnp_Params);
        console.log('IPN verification result:', result);

        // Check signature first
        if (!result.isValid) {
            console.error('Invalid IPN signature:', result.message);
            // Return error response to VNPAY - RspCode: '97' for invalid checksum
            return res.status(200).json({ RspCode: '97', Message: 'Checksum failed' });
        }

        // Find payment by vnp_TxnRef
        let payment = await Payment.findOne({ 
            vnp_TxnRef: result.orderId,
            paymentMethod: 'VnPay'
        });

        if (!payment) {
            // Try to find by order ID directly
            payment = await Payment.findOne({
                order: result.orderId,
                paymentMethod: 'VnPay'
            });
            
            if (payment && !payment.vnp_TxnRef) {
                payment.vnp_TxnRef = result.orderId;
                await payment.save();
            }
        }

        // Check if payment exists
        if (!payment) {
            console.error('Payment not found for IPN:', result.orderId);
            // Return error response to VNPAY - RspCode: '01' for order not found
            return res.status(200).json({ RspCode: '01', Message: 'Order not found' });
        }

        // Check if payment is already confirmed (status is 'Paid')
        if (payment.status === 'Paid') {
            console.log('Payment already confirmed:', payment._id);
            // Return response to VNPAY - RspCode: '02' for already confirmed
            return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
        }

        // Validate amount (convert VNPAY amount from cents to VND)
        const vnpAmount = parseInt(vnp_Params.vnp_Amount) / 100;
        const paymentAmount = parseFloat(payment.amount);
        
        // Allow small difference due to rounding (0.01 VND)
        if (Math.abs(vnpAmount - paymentAmount) > 0.01) {
            console.error('Amount mismatch:', {
                vnpAmount: vnpAmount,
                paymentAmount: paymentAmount,
                difference: Math.abs(vnpAmount - paymentAmount)
            });
            // Return error response to VNPAY - RspCode: '04' for invalid amount
            return res.status(200).json({ RspCode: '04', Message: 'Invalid amount' });
        }

        // Update payment status based on IPN
        // Note: According to VNPAY docs, IPN should return RspCode='00' even if transaction failed
        // The merchant should still confirm receipt of the notification
        if (result.isSuccess) {
            payment.status = 'Paid';
            payment.vnp_TransactionNo = result.transactionNo;
            payment.vnp_BankCode = result.bankCode;
            payment.vnp_ResponseCode = result.responseCode;
            payment.vnp_TransactionStatus = result.transactionStatus;
            payment.vnp_PayDate = result.payDate;
            payment.paymentDate = new Date();

            // Update order status to Paid when payment is successful
            const order = await Order.findById(payment.order);
            if (order) {
                order.status = 'Paid';
                await order.save();
                console.log('Order status updated to Paid via IPN:', order._id);
                
                // Decrease book stock when payment is successful
                try {
                    await decreaseBookStock(order);
                } catch (stockError) {
                    console.error('Error decreasing stock via IPN:', stockError);
                    // Don't fail the payment processing if stock decrease fails
                }
            }
        } else {
            payment.status = 'Failed';
            payment.vnp_ResponseCode = result.responseCode;
            payment.vnp_TransactionStatus = result.transactionStatus;
            console.log('Payment failed via IPN:', result.message);
        }

        await payment.save();
        console.log('Payment updated via IPN:', {
            paymentId: payment._id,
            status: payment.status,
            orderId: payment.order
        });

        // Return success response to VNPAY
        // According to VNPAY docs, IPN should return RspCode='00' to confirm receipt
        // This means "I received and processed the notification successfully"
        // Even if the transaction itself failed (vnp_ResponseCode != '00'), we still return RspCode='00'
        return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
    } catch (error) {
        console.error('Error handling VNPAY IPN:', error);
        console.error('Error stack:', error.stack);
        // Return error response to VNPAY
        return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
    }
};

// VnPay callback handler (ReturnURL)
export const vnpayCallback = async (req, res) => {
    try {
        const vnp_Params = req.query;
        console.log('VNPAY Callback received:', {
            vnp_TxnRef: vnp_Params.vnp_TxnRef,
            vnp_ResponseCode: vnp_Params.vnp_ResponseCode,
            vnp_Amount: vnp_Params.vnp_Amount
        });

        const result = verifyPaymentCallback(vnp_Params);
        console.log('Payment verification result:', result);

        if (!result.isValid) {
            console.error('Invalid payment callback:', result.message);
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}`);
        }

        // Find payment by vnp_TxnRef (which is the orderId string)
        const payment = await Payment.findOne({ 
            vnp_TxnRef: result.orderId,
            paymentMethod: 'VnPay'
        });

        console.log('Payment lookup:', {
            searchingFor: result.orderId,
            paymentFound: payment ? payment._id : null,
            paymentOrderId: payment?.order
        });

        if (!payment) {
            console.error('Payment not found for vnp_TxnRef:', result.orderId);
            // Try to find by order ID directly
            const paymentByOrder = await Payment.findOne({
                order: result.orderId,
                paymentMethod: 'VnPay'
            });
            if (paymentByOrder) {
                console.log('Found payment by order ID:', paymentByOrder._id);
                // Update vnp_TxnRef if missing
                if (!paymentByOrder.vnp_TxnRef) {
                    paymentByOrder.vnp_TxnRef = result.orderId;
                    await paymentByOrder.save();
                }
                // Use this payment
                const order = await Order.findById(paymentByOrder.order);
                if (order && result.isSuccess) {
                    order.status = 'Paid';
                    await order.save();
                    console.log('Order status updated to Paid:', order._id);
                    
                    // Decrease book stock when payment is successful
                    try {
                        await decreaseBookStock(order);
                    } catch (stockError) {
                        console.error('Error decreasing stock via callback:', stockError);
                        // Don't fail the payment processing if stock decrease fails
                    }
                }
                paymentByOrder.status = result.isSuccess ? 'Paid' : 'Failed';
                paymentByOrder.vnp_ResponseCode = result.responseCode;
                if (result.isSuccess) {
                    paymentByOrder.vnp_TransactionNo = result.transactionNo;
                    paymentByOrder.vnp_BankCode = result.bankCode;
                    paymentByOrder.vnp_PayDate = result.payDate;
                    paymentByOrder.paymentDate = new Date();
                }
                await paymentByOrder.save();
                
                if (result.isSuccess) {
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${paymentByOrder.order}`);
                } else {
                    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}`);
                }
            }
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

            // Update order status to Paid when payment is successful
            const order = await Order.findById(payment.order);
            if (order) {
                order.status = 'Paid';
                await order.save();
                console.log('Order status updated to Paid:', order._id);
                
                // Decrease book stock when payment is successful
                try {
                    await decreaseBookStock(order);
                } catch (stockError) {
                    console.error('Error decreasing stock via callback:', stockError);
                    // Don't fail the payment processing if stock decrease fails
                }
            } else {
                console.error('Order not found for payment:', payment.order);
            }
        } else {
            payment.status = 'Failed';
            payment.vnp_ResponseCode = result.responseCode;
            console.log('Payment failed:', result.message);
        }

        await payment.save();
        console.log('Payment saved:', {
            paymentId: payment._id,
            status: payment.status,
            orderId: payment.order
        });

        // Redirect to frontend
        if (result.isSuccess) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${payment.order}`);
        } else {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failed?message=${encodeURIComponent(result.message)}`);
        }
    } catch (error) {
        console.error('Error handling VnPay callback:', error);
        console.error('Error stack:', error.stack);
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
