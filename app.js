require("dotenv").config();

const cors = require("cors");
const rateLimit = require("express-rate-limit");

const express = require("express");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error.middleware");

const app = express();
app.set("trust proxy", 1);

//  DATABASE 

connectDB();


//  MIDDLEWARE 

app.use(express.json());

app.use(express.static("public"));

// ================= CORS =================

app.use(cors());


// ================= RATE LIMITING =================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => {
        return req.ip;
    },
    message: {
        message: "Too many requests, please try again later."
    }
});
app.use(limiter);

//  ROUTES 

const bookRoutes = require("./routes/book.routes");
const userRoutes = require("./routes/user.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/books", bookRoutes);
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use(errorHandler);



//  HOME 

app.get("/register.html", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(__dirname + "/public/dashboard.html");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});
//  SERVER 

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;