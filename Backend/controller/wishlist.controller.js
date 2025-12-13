import Wishlist from "../model/wishlist.model.js";
import Book from "../model/book.model.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ customer: req.user._id })
            .populate({
                path: 'books',
                populate: { path: 'category' }
            });

        if (!wishlist) {
            wishlist = await Wishlist.create({ 
                customer: req.user._id, 
                books: [] 
            });
        }

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add book to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { bookId } = req.body;

        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        let wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                customer: req.user._id,
                books: [bookId]
            });
        } else {
            // Check if book already in wishlist
            if (wishlist.books.includes(bookId)) {
                return res.status(400).json({ message: "Book already in wishlist" });
            }
            wishlist.books.push(bookId);
            await wishlist.save();
        }

        await wishlist.populate({
            path: 'books',
            populate: { path: 'category' }
        });

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove book from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;

        const wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        wishlist.books = wishlist.books.filter(
            book => book.toString() !== bookId
        );

        await wishlist.save();
        await wishlist.populate({
            path: 'books',
            populate: { path: 'category' }
        });

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ customer: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }

        wishlist.books = [];
        await wishlist.save();

        res.status(200).json(wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if book is in wishlist
export const isInWishlist = async (req, res) => {
    try {
        const { bookId } = req.params;

        const wishlist = await Wishlist.findOne({ customer: req.user._id });

        const inWishlist = wishlist && wishlist.books.includes(bookId);

        res.status(200).json({ inWishlist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








