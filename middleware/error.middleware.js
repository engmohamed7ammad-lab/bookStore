const errorHandler = (err, req, res, next) => {

    console.error(err);

    // Mongoose Validation Error
    if (err.name === "ValidationError") {

        const errors = Object.values(err.errors)
            .map(error => error.message);

        return res.status(400).json({
            message: "Validation failed",
            errors
        });
    }

    // Mongoose Invalid ObjectId
    if (err.name === "CastError") {
        return res.status(400).json({
            message: "Invalid ID"
        });
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        return res.status(400).json({
            message: "Duplicate value already exists"
        });
    }

    // Default Server Error
    res.status(500).json({
        message: "Server error"
    });
};

module.exports = errorHandler;