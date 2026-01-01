import mongoose from "mongoose";

const userCourseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "orders",
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    activatedAt: {
        type: Date
    }
}, { timestamps: true });

userCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });
userCourseSchema.index({ userId: 1, isActive: 1 });

export const userCourseModel = mongoose.model('userCourses', userCourseSchema);