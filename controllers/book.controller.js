const Book = require("../models/book.model");

// ================= CREATE BOOK =================

const createBook = async (req, res, next) => {
    try {
        const { title, price, author } = req.body;

        const book = await Book.create({
            title,
            price,
            author
        });

        res.status(201).json(book);

    } catch (error) {
        next(error);
    }
};


// ================= GET ALL BOOKS =================

const getBooks = async (req, res, next) => {
    try {
        const books = await Book.find();

        res.status(200).json(books);

    } catch (error) {
        next(error);
    }
};


// ================= GET BOOK BY ID =================

const getBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (error) {
        next(error);
    }
};


// ================= UPDATE BOOK =================

const updateBook = async (req, res, next) => {
    try {
        const { title, price, author } = req.body;

        const book = await Book.findByIdAndUpdate(
            req.params.id,
            {
                title,
                price,
                author
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json(book);

    } catch (error) {
        next(error);
    }
};


// ================= DELETE BOOK =================

const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);

        if (!book) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.status(200).json({
            message: "Book deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook
};