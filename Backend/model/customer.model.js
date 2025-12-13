import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    
    // Email verification fields
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    activationToken: {
        type: String
    },
    activationTokenExpires: {
        type: Date
    }
}, {
    timestamps: true
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
