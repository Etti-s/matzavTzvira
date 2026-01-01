import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String },
    videoUrl: { type: String },
    durationMinutes: { type: Number }
}, { _id: true });

export const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    numLessons: { type: Number, required: true },
    imgUrl: { type: String, required: true },
    isPurchasable: {
        type: Boolean,
        default: true
    },
    videos: [videoSchema],
    notes: { type: String }
}, { timestamps: true });

export const courseModel = mongoose.model('courses', courseSchema);