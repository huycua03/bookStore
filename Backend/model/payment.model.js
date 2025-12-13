import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
        type: String, 
        enum: ['Credit Card', 'PayPal', 'Cash', 'VnPay'], 
        required: true 
    },
    paymentDate: { type: Date, default: Date.now },
    status: { 
        type: String, 
        enum: ['Paid', 'Pending', 'Failed', 'Cancelled'], 
        default: 'Pending' 
    },
    // VnPay specific fields
    vnp_TransactionNo: { type: String },
    vnp_BankCode: { type: String },
    vnp_ResponseCode: { type: String },
    vnp_TxnRef: { type: String }, // Order ID used in VnPay
    vnp_PayDate: { type: String }
}, {
    timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
