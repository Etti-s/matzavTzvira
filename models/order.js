import mongoose from "mongoose";

const courseMinimalSchema=new mongoose.Schema({
    name: String,
    price: Number,
    numLessons: Number,
    imgUrl: String
})

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    product: [ courseMinimalSchema ],
    status: {
        type: String,
        enum: [ "pending","paid","active","cancelled"],
        default: 'pending'
    }

}, { timestamps: true })

export const orderModel = mongoose.model('orders', orderSchema);