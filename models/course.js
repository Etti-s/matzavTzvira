import mongoose from "mongoose"

export const courseSchema = new mongoose.Schema({
    name: String,
    price: Number,
    numLessons: Number,
    contentLength: Number,
    imgUrl: String,
    isPurchasable: {
        type: Boolean,
        default: true
    },
    videos: [
        {
            title: String,
            videoUrl: String,
            durationMinutes: Number 
        }
    ],
    notes: String
});


export const courseModel = mongoose.model('courses', courseSchema);
