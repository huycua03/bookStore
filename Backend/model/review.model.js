import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    book: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Book', 
        required: true 
    },
    customer: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Customer', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    comment: { 
        type: String, 
        required: true 
    },
    helpful: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Ensure one review per customer per book
reviewSchema.index({ book: 1, customer: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);








