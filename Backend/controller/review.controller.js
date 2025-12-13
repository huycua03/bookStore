import Review from "../model/review.model.js";
import Book from "../model/book.model.js";

// Create a review
export const createReview = async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;
        
        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if user already reviewed this book
        const existingReview = await Review.findOne({
            book: bookId,
            customer: req.user._id
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this book" });
        }

        // Create new review
        const review = new Review({
            book: bookId,
            customer: req.user._id,
            rating,
            comment
        });

        await review.save();
        await review.populate('customer', 'fullname');
        
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a book
export const getBookReviews = async (req, res) => {
    try {
        const { bookId } = req.params;
        
        const reviews = await Review.find({ book: bookId })
            .populate('customer', 'fullname')
            .sort({ createdAt: -1 });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0;

        res.status(200).json({
            reviews,
            avgRating: avgRating.toFixed(1),
            totalReviews: reviews.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: id,
            customer: req.user._id
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        review.rating = rating;
        review.comment = comment;
        await review.save();
        await review.populate('customer', 'fullname');

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findOneAndDelete({
            _id: id,
            customer: req.user._id
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found or unauthorized" });
        }

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark review as helpful
export const markHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByIdAndUpdate(
            id,
            { $inc: { helpful: 1 } },
            { new: true }
        ).populate('customer', 'fullname');

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








