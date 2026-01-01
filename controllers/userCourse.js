import { userCourseModel } from '../models/userCourse.js';
import { courseModel } from '../models/course.js';
import { orderModel } from '../models/order.js';

// קבלת כל הקורסים הפעילים של משתמש
export async function getUserActiveCourses(req, res) {
    try {
        const { userId } = req.params;

        // שליפת רשומות userCourse פעילות
        const userCourses = await userCourseModel
            .find({ userId, isActive: true })
            .sort({ activatedAt: -1 })
            .lean(); // מחזיר אובייקט רגיל במקום Mongoose document

        if (userCourses.length === 0) {
            return res.json([]);
        }

        // שליפת הקורסים בנפרד
        const courseIds = userCourses.map(uc => uc.courseId);
        const courses = await courseModel.find({ _id: { $in: courseIds } }).lean();

        // שליפת ההזמנות בנפרד
        const orderIds = userCourses.map(uc => uc.orderId);
        const orders = await orderModel.find({ _id: { $in: orderIds } }, 'status createdAt').lean();

        // שילוב הנתונים
        const result = userCourses.map(uc => {
            const course = courses.find(c => c._id.toString() === uc.courseId.toString());
            const order = orders.find(o => o._id.toString() === uc.orderId.toString());

            return {
                ...course,
                purchaseInfo: {
                    activatedAt: uc.activatedAt,
                    orderId: uc.orderId,
                    orderStatus: order?.status,
                    orderDate: order?.createdAt
                }
            };
        });

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving user courses", 
            message: err.message 
        });
    }
}

// קבלת כל הקורסים של משתמש (כולל לא פעילים)
export async function getAllUserCourses(req, res) {
    try {
        const { userId } = req.params;

        const userCourses = await userCourseModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        if (userCourses.length === 0) {
            return res.json([]);
        }

        // שליפת הקורסים
        const courseIds = userCourses.map(uc => uc.courseId);
        const courses = await courseModel.find({ _id: { $in: courseIds } }).lean();

        // שליפת ההזמנות
        const orderIds = userCourses.map(uc => uc.orderId);
        const orders = await orderModel.find({ _id: { $in: orderIds } }, 'status createdAt').lean();

        // שילוב הנתונים
        const result = userCourses.map(uc => {
            const course = courses.find(c => c._id.toString() === uc.courseId.toString());
            const order = orders.find(o => o._id.toString() === uc.orderId.toString());

            return {
                userCourseId: uc._id,
                isActive: uc.isActive,
                activatedAt: uc.activatedAt,
                purchaseDate: uc.createdAt,
                course: course,
                order: {
                    id: uc.orderId,
                    status: order?.status,
                    createdAt: order?.createdAt
                }
            };
        });

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving user courses", 
            message: err.message 
        });
    }
}

// בדיקה האם משתמש יכול לצפות בקורס מסוים
export async function canUserAccessCourse(req, res) {
    try {
        const { userId, courseId } = req.params;

        const userCourse = await userCourseModel.findOne({ 
            userId, 
            courseId, 
            isActive: true 
        }).lean();

        if (!userCourse) {
            return res.json({ 
                canAccess: false,
                message: "You don't have access to this course"
            });
        }

        return res.json({ 
            canAccess: true,
            activatedAt: userCourse.activatedAt
        });
    } catch (err) {
        return res.status(500).json({ 
            title: "Error checking course access", 
            message: err.message 
        });
    }
}