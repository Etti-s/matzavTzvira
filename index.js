import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import { connectToDB } from "./config/db.js";
import courseRouter from "./routes/course.js";
import userRouter from "./routes/user.js";
import orderRouter from "./routes/order.js";
import userCourseRouter from "./routes/userCourse.js";
dotenv.config();

const app=express()

app.use(express.json())
app.use(cors())

connectToDB();

app.use("/api/courses", courseRouter)
app.use("/api/users", userRouter)
app.use("/api/orders", orderRouter)
app.use("/api/user-courses", userCourseRouter);


let port=process.env.PORT
app.listen(port, () => {
    console.log("Server running on port " + port);
})
