import Book from "../model/book.model.js";
import Category from "../model/category.model.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lưu ảnh trong thư mục public/images của Backend
const uploadDir = path.resolve(__dirname, '../public/images');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Tạo mới sách
export const createBook = async (req, res) => {
    try {
        const { title, price, categoryId, description, stock } = req.body;
        const image = req.file ? req.file.filename : null; // Lấy tên file đã upload

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const book = new Book({ 
            title, 
            price, 
            category: categoryId, 
            description, 
            image, 
            stock 
        });
        await book.save();
        await book.populate('category');
        
        // Format image URL like getBooks
        const bookData = {
            ...book._doc,
            image: book.image ? `/images/${book.image}` : null
        };
        
        res.status(201).json(bookData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách tất cả sách
export const getBooks = async (req, res) => {
    try {
        const books = await Book.find().populate('category');
        // Add full image URL to each book
        const booksWithImages = books.map(book => ({
            ...book._doc,
            image: book.image ? `/images/${book.image}` : null
        }));
        res.status(200).json(booksWithImages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
                             .populate('category');
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        const bookData = {
            ...book._doc,
            image: book.image ? `/images/${book.image}` : null
        };
        res.status(200).json(bookData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật sách
export const updateBook = async (req, res) => {
    try {
        const { title, price, description, stock } = req.body;
        const updateData = { 
            title, 
            price, 
            description, 
            stock 
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true }
        ).populate('category');
        
        // Format image URL like getBooks
        const bookData = {
            ...book._doc,
            image: book.image ? `/images/${book.image}` : null
        };
        
        res.status(200).json(bookData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa sách
export const deleteBook = async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Book deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { upload };
