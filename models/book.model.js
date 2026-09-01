const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 2
    },

    price: {
        type: Number,
        required: true,
        min: 1
    },

    author: {
        type: String,
        required: true
    }
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;