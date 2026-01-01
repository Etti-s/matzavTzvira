import { courseModel } from '../models/course.js';
import { orderModel } from '../models/order.js';
import { userModel } from '../models/user.js';
import { userCourseModel } from '../models/userCourse.js';


// שליפת כל ההזמנות
export async function getOrders(req, res) {
    try {
        let result = await orderModel.find()
            .populate('userId', 'username email profileImageUrl')
            .sort({ createdAt: -1 }); // הזמנות אחרונות קודם
        return res.json(result);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving orders", 
            message: err.message 
        });
    }
}

// הוספת הזמנה
export async function addOrder(req, res) {
    let { userId, productIds } = req.body; 
    
    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0)
        return res.status(400).json({ 
            title: "missing data", 
            message: "userId and productIds (array) are required" 
        });

    try {
        // בדיקת משתמש
        let user = await userModel.findById(userId);
        if (!user)
            return res.status(404).json({ 
                title: "invalid user", 
                message: "user not found" 
            });

        // שליפת כל הקורסים
        let products = await courseModel.find({ _id: { $in: productIds } });
        
        if (products.length !== productIds.length)
            return res.status(404).json({ 
                title: "invalid products", 
                message: "some products not found" 
            });

        // בדיקה שכל הקורסים זמינים לרכישה
        let unavailableProducts = products.filter(p => !p.isPurchasable);
        if (unavailableProducts.length > 0)
            return res.status(400).json({ 
                title: "products not available", 
                message: `The following courses are not available for purchase: ${unavailableProducts.map(p => p.name).join(', ')}` 
            });
         // בדיקה שהמשתמש לא רכש כבר את הקורסים האלה
        let existingPurchases = await userCourseModel.find({
            userId,
            courseId: { $in: productIds }
        });

        if (existingPurchases.length > 0) {
            let alreadyPurchased = existingPurchases.map(uc => 
                products.find(p => p._id.toString() === uc.courseId.toString())?.name
            ).filter(Boolean);
            
            return res.status(409).json({ 
                title: "already purchased", 
                message: `You already own: ${alreadyPurchased.join(', ')}` 
            });
        }
        // יצירת מערך של קורסים מינימליים 
        let productsMinimal = products.map(product => ({
            name: product.name, 
            price: product.price, 
            numLessons: product.numLessons, 
            imgUrl: product.imgUrl
        }));

        // חישוב מחיר כולל
        let totalPrice = products.reduce((sum, product) => sum + product.price, 0);
        
        // יצירת הזמנה חדשה
        let newOrder = new orderModel({ 
            userId, 
            products: productsMinimal,
            totalPrice
        });
        await newOrder.save();


         // יצירת רשומות userCourse לכל קורס (עדיין לא פעילים)
        let userCoursesData = productIds.map(courseId => ({
            userId,
            courseId,
            orderId: newOrder._id,
            isActive: false
        }));

        await userCourseModel.insertMany(userCoursesData);
        return res.status(201).json(newOrder);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error adding order", 
            message: err.message 
        });
    }
}

// ביטול הזמנה
export async function cancelOrder(req, res) {
    let orderId = req.params.id;
    try {
        let order = await orderModel.findById(orderId);
        if (!order)
            return res.status(404).json({ 
                title: "invalid order", 
                message: "order not found" 
            });

        if (order.status !== 'pending')
            return res.status(400).json({ 
                title: "cannot cancel order", 
                message: "only pending orders can be cancelled" 
            });

        order.status = 'cancelled';
        await order.save();
        return res.json(order);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error cancelling order", 
            message: err.message 
        });
    }
}

// עדכון סטטוס הזמנה
export async function updateOrderStatus(req, res) {
    let orderId = req.params.id;
    try {
        let order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                title: "invalid order", 
                message: "order not found" 
            });
        }

        if (order.status === 'pending') {
            order.status = "paid";
              //  כאן מפעילים את הקורסים! 
            await userCourseModel.updateMany(
                { orderId: order._id },
                { 
                    isActive: true,
                    activatedAt: new Date()
                }
            );
        }
        else if (order.status === 'paid') {
            order.status = "active";
        }
        else if (order.status === 'active') {
            return res.status(400).json({ 
                title: "cannot update order status", 
                message: "order is already active" 
            });
        }
        else if (order.status === 'cancelled') {
            return res.status(400).json({ 
                title: "cannot update order status", 
                message: "cannot update cancelled order" 
            });
        }

        await order.save();
        return res.json(order);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error updating order status", 
            message: err.message 
        });
    }
}

// שליפת הזמנה לפי ID
export async function getOrderById(req, res) {
    let orderId = req.params.id;
    try {
        let order = await orderModel.findById(orderId)
            .populate('userId', 'username email profileImageUrl');
        
        if (!order)
            return res.status(404).json({ 
                title: "invalid order", 
                message: "order not found" 
            });

        return res.json(order);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving order", 
            message: err.message 
        });
    }
}

// שליפת הזמנות לפי משתמש
export async function getOrdersByUser(req, res) {
    let userId = req.params.userId;
    try {
        let orders = await orderModel.find({ userId })
            .sort({ createdAt: -1 }); // הזמנות אחרונות קודם
        return res.json(orders);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving orders", 
            message: err.message 
        });
    }
}