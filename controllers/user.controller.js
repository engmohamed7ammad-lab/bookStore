const bcrypt = require("bcrypt");
const User = require("../models/user.model");


// =================================================
// ================= CREATE USER ===================
// =================================================

const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        // Check existing email
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.trim(),
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        next(error);
    }
};


// =================================================
// ================= GET ALL USERS =================
// =================================================

const getUsers = async (req, res, next) => {
    try {

        const users =
            await User.find()
                .select("-password");

        res.status(200).json(users);

    } catch (error) {
        next(error);
    }
};


// =================================================
// ================= GET USER BY ID ================
// =================================================

const getUserById = async (req, res, next) => {
    try {

        const user =
            await User.findById(req.params.id)
                .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json(user);

    } catch (error) {
        next(error);
    }
};


// =================================================
// ================= UPDATE USER ===================
// =================================================

const updateUser = async (req, res, next) => {
    try {

        const { name, email, password, role } = req.body;

        const updateData = {};


        // ================= NAME =================

        if (name !== undefined) {

            if (!name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }

            updateData.name = name.trim();
        }


        // ================= EMAIL ================

        if (email !== undefined) {

            if (!email.trim()) {
                return res.status(400).json({
                    message: "Email cannot be empty"
                });
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            // Check if email belongs to another user
            const existingUser =
                await User.findOne({
                    email: normalizedEmail,
                    _id: { $ne: req.params.id }
                });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            updateData.email = normalizedEmail;
        }


        // ================= PASSWORD =============

        if (password !== undefined && password !== "") {

            updateData.password =
                await bcrypt.hash(password, 10);
        }


        // ================= ROLE =================

        if (role !== undefined) {

            if (!["admin", "user"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid role"
                });
            }

            updateData.role = role;
        }


        // ================= UPDATE ================

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No data to update"
            });
        }


        const user =
            await User.findByIdAndUpdate(
                req.params.id,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            message: "User updated successfully",
            user
        });

    } catch (error) {
        next(error);
    }
};


// =================================================
// ================= DELETE USER ===================
// =================================================

const deleteUser = async (req, res, next) => {
    try {

        // Prevent admin from deleting himself
        if (
            String(req.params.id) ===
            String(req.user.userId)
        ) {
            return res.status(400).json({
                message: "You cannot delete your own account"
            });
        }


        const user =
            await User.findByIdAndDelete(
                req.params.id
            );


        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};