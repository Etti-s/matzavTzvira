import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    status: { type: Boolean, default: true },
    profileImageUrl: { type: String, default: 'https://i.pinimg.com/736x/b6/47/0b/b6470b72ee3ad6dc963ad5a5f792b264.jpg' },


})

export const userModel=mongoose.model('users',userSchema);