require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const path = require("path");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

const app = express();

// ================= PROXY =================

app.set("trust proxy", 1);

// ================= DATABASE =================

connectDB();

// ================= MIDDLEWARE =================

app.use(express.json());

app.use(cors());

// ================= STATIC FILES =================

app.use(express.static(path.join(__dirname, "public")));

// ================= RATE LIMITING =================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Too many requests, please try again later."
    }
});
app.use(limiter);

// ================= ROUTES =================

const bookRoutes = require("./routes/book.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/books", bookRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

//  HTML PAGES 

// Login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register page
app.get("/register.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "register.html"));
});

// Dashboard page
app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

//  ERROR HANDLER 

app.use(errorHandler);

//  SERVER 

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;