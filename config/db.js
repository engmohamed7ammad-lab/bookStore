const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {

        // Use public DNS servers
        dns.setServers([
            "8.8.8.8",
            "1.1.1.1"
        ]);

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

    } catch (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

        process.exit(1);
    }
};

module.exports = connectDB;