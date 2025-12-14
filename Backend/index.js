import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';

import categoryRoute from './route/category.route.js';

import bookRoute from './route/book.route.js';
import customerRoute from './route/customer.route.js';
import orderRoute from './route/order.route.js';
import paymentRoute from './route/payment.route.js';
import cartRoute from './route/cart.route.js';
import reviewRoute from './route/review.route.js';
import wishlistRoute from './route/wishlist.route.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for VNPAY IPN)

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Đọc các biến môi trường
dotenv.config();

// Lấy cổng và URI MongoDB từ file .env
const PORT = process.env.PORT || 4000;
const URI = process.env.MongoDBURI;

// Kết nối tới MongoDB
mongoose.connect(URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.log("Error: ", error));

// Định nghĩa các routes
app.use("/api", bookRoute);
app.use('/api', categoryRoute);
app.use('/api', customerRoute);
app.use('/api', orderRoute);
app.use('/api', paymentRoute);
app.use('/api', cartRoute);
app.use('/api', reviewRoute);
app.use('/api', wishlistRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
