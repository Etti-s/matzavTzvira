import mongoose from "mongoose";

const courseMinimalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    numLessons: { type: Number, required: true },
    imgUrl: { type: String, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    products: [courseMinimalSchema], 
    totalPrice: { type: Number, required: true }, 
    status: {
        type: String,
        enum: ["pending", "paid", "active", "cancelled"],
        default: 'pending'
    }
}, { timestamps: true });

export const orderModel = mongoose.model('orders', orderSchema);