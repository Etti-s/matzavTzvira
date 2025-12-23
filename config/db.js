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
}