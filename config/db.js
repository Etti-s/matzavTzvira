import mongoose from "mongoose";

export function connectToDB() {

    mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Connected to database");
        })
        .catch((err) => {
            console.log("Error connecting to database", err);
            process.exit(1);
        });
    // טיפול בניתוק פתאומי
    mongoose.connection.on('disconnected', () => {
        console.warn("⚠️ MongoDB disconnected");
    });

    // טיפול בשגיאות אחרי החיבור הראשוני
    mongoose.connection.on('error', (err) => {
        console.error("❌ MongoDB connection error:", err.message);
    });
}