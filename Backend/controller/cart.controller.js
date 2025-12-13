import Cart from "../model/cart.model.js";
import Book from "../model/book.model.js";

// Get user's cart
export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id }).populate('items.book');
        if (!cart) {
            return res.status(200).json({ items: [] });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        
        // Check if book exists
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check stock
        if (book.stock < quantity) {
            return res.status(400).json({ message: "Not enough stock" });
        }

        let cart = await Cart.findOne({ customer: req.user._id });

        if (!cart) {
            // Create new cart
            cart = new Cart({
                customer: req.user._id,
                items: [{ book: bookId, quantity }]
            });
        } else {
            // Check if item already in cart
            const itemIndex = cart.items.findIndex(item => 
                item.book.toString() === bookId
            );

            if (itemIndex > -1) {
                // Update quantity
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.items.push({ book: bookId, quantity });
            }
            cart.updatedAt = Date.now();
        }

        await cart.save();
        await cart.populate('items.book');
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        const cart = await Cart.findOne({ customer: req.user._id });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        if (quantity === 0) {
            // Remove item
            cart.items = cart.items.filter(item => 
                item.book.toString() !== bookId
            );
        } else {
            // Update quantity
            const itemIndex = cart.items.findIndex(item => 
                item.book.toString() === bookId
            );

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = quantity;
            } else {
                return res.status(404).json({ message: "Item not in cart" });
            }
        }

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.book');
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { bookId } = req.params;

        const cart = await Cart.findOne({ customer: req.user._id });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = cart.items.filter(item => 
            item.book.toString() !== bookId
        );

        cart.updatedAt = Date.now();
        await cart.save();
        await cart.populate('items.book');
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear cart
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ customer: req.user._id });
        
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        cart.items = [];
        cart.updatedAt = Date.now();
        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};








