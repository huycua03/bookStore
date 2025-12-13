import express from 'express';
import { 
    getWishlist, 
    addToWishlist, 
    removeFromWishlist,
    clearWishlist,
    isInWishlist
} from '../controller/wishlist.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All wishlist routes require authentication
router.get('/wishlist', verifyToken, getWishlist);
router.post('/wishlist', verifyToken, addToWishlist);
router.delete('/wishlist/:bookId', verifyToken, removeFromWishlist);
router.delete('/wishlist', verifyToken, clearWishlist);
router.get('/wishlist/check/:bookId', verifyToken, isInWishlist);

export default router;








