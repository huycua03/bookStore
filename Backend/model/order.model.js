import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer',
        required: false // Optional for backward compatibility
    },
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String },
    items: [{
        _id: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String }
    }],
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 
        default: 'Pending' 
    },
    stockDecreased: { 
        type: Boolean, 
        default: false 
    },
    orderDate: { type: Date, default: Date.now }
});

export default mongoose.model('Order', orderSchema);
