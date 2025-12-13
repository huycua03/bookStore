import express from 'express';
import { 
    createReview, 
    getBookReviews, 
    updateReview, 
    deleteReview,
    markHelpful
} from '../controller/review.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/review/book/:bookId', getBookReviews);

// Protected routes
router.post('/review', verifyToken, createReview);
router.put('/review/:id', verifyToken, updateReview);
router.delete('/review/:id', verifyToken, deleteReview);
router.put('/review/:id/helpful', markHelpful);

export default router;








