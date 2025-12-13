/**
 * Quick script to activate any account manually
 * Usage: node activate-account-quick.js EMAIL
 */

import mongoose from 'mongoose';
import Customer from './model/customer.model.js';

const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide email: node activate-account-quick.js EMAIL');
    process.exit(1);
}

const MONGODB_URI = process.env.MongoDBURI || 'mongodb://localhost:27017/bookstore';

mongoose.connect(MONGODB_URI)
    .then(async () => {
        const customer = await Customer.findOne({ email });
        
        if (!customer) {
            console.error(`❌ No customer found: ${email}`);
            process.exit(1);
        }
        
        if (customer.isVerified) {
            console.log('✅ Already activated!');
            process.exit(0);
        }
        
        customer.isVerified = true;
        customer.activationToken = undefined;
        customer.activationTokenExpires = undefined;
        await customer.save();
        
        console.log(`🎉 Activated: ${customer.fullname} (${email})`);
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });

