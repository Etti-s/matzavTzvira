import { courseModel } from '../models/course.js';
import  { orderModel } from '../models/order.js';
import { userModel } from '../models/user.js';

// שליפת כל ההזמנות
export async function getOrders(req, res) {
    try {
        let result = await orderModel.find()
        return res.json(result)
    }
    catch (x) {
        return res.status(500).json({ title: "Error retrieving orders", message: x.message })
    }

}
// הוספת הזמנה
export async function addOrder(req, res) {

    let { userId, productId } = req.body
    if (!userId || !productId )
        return res.status(400).json({ title: "missing data", message: "userId, productId are required" })
    try {
        let user = await userModel.findById(userId)
        if (!user)
            return res.status(404).json({ title: "invalid user", message: "user not found" })
        let product = await courseModel.findById(productId)
        if (!product)
            return res.status(404).json({ title: "invalid product", message: "product not found" })
        let productMinimal = { _id:product._id,name: product.name, price: product.price, numLessons: product.numLessons, imgUrl: product.imgUrl }
        let newOrder = new orderModel({ userId, product: productMinimal })
        await newOrder.save()
        return res.status(201).json(newOrder)


    }
    catch (x) {
        return res.status(500).json({ title: "Error adding order", message: x })
    }

}
// ביטול הזמנה
export async function cancelOrder(req, res) {
    let orderId = req.params.id
    try {
        let order = await orderModel.findById(orderId)
        if (!order)
            return res.status(404).json({ title: "invalid order", message: "order not found" })

        if (order.status !== 'pending')
            return res.status(400).json({ title: "cannot cancel order", message: "only pending orders can be cancelled" })
        order.status = 'cancelled'
        await order.save()
        return res.json(order)
    }
    catch (x) {
        return res.status(500).json({ title: "Error cancelling order", message: x })
    }
}

// עדכון סטטוס הזמנה
export async function updateOrderStatus(req, res) {

    let orderId = req.params.id
    try {
        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ title: "invalid order", message: "order not found" })
        }
        if (order.status === 'pending') {
           order.status="paid"
        }
        else if (order.status === 'paid') {
           order.status="active"
        }
        else if (order.status === 'active') {
           return res.status(400).json({ title: "cannot update order status", message: "cannot update active order" })
        }

        else if (order.status === 'cancelled') {
            return res.status(400).json({ title: "cannot update order status", message: "cannot update cancelled order" })
        }
        await order.save();
        return res.json(order);
    }
    catch (x) {
        return res.status(500).json({ title: "Error updating order status", message: x })
    }

}
// שליפת הזמנה לפי משתמש
export async function getOrderById(req, res) {
    let orderId = req.params.id
    try {
        let order = await orderModel.findById(orderId).populate('userId', '-password -status -__v -createdAt -updatedAt')
        if (!order)
            return res.status(404).json({ title: "invalid order", message: "order not found" })
        return res.json(order)
    }
    catch (x) {
        return res.status(500).json({ title: "Error retrieving order", message: x })
    }
}
// שליפת הזמנה לפי משתמש
export async function getOrdersByUser(req, res) {
    let userId = req.params.userId
    try {
        let orders = await orderModel.find({ userId :userId})
        return res.json(orders)
    }
    catch (x) {
        return res.status(500).json({ title: "Error retrieving orders", message: x })
    }
}
