const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const {
    createBook,
    getBooks,
    getBook,
    updateBook,
    deleteBook
} = require("../controllers/book.controller");


//  GET ALL BOOKS 

// User + Admin
router.get("/", authenticate, getBooks);

//  GET BOOK BY ID 
router.get(
    "/:id",
    authenticate,
    getBook
);


//  CREATE BOOK 
// Admin only
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createBook
);


//  UPDATE BOOK 
// Admin only
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateBook
);

//  DELETE BOOK 
// Admin only
router.delete(
 "/:id",
    authenticate,
    authorize("admin"),
    deleteBook
);


module.exports = router;