const express = require("express");

const router = express.Router();

const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/user.controller");

const authenticate = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");


//  USER MANAGEMENT 

// CREATE USER — Admin only
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createUser
);


// GET ALL USERS — Admin only
router.get(
    "/",
    authenticate,
    authorize("admin"),
    getUsers
);


// GET USER BY ID — Admin only
router.get(
    "/:id",
    authenticate,
    authorize("admin"),
    getUserById
);


// UPDATE USER — Admin only
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateUser
);


// DELETE USER — Admin only
router.delete(
    "/:id",
    authenticate,
    authorize("admin"),
    deleteUser
);


module.exports = router;