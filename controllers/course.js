import { courseModel } from "../models/course.js";

// קבלת כל הקורסים עם פגינציה
export const getCourses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const courses = await courseModel
            .find({})
            .skip(skip)
            .limit(limit);

        const total = await courseModel.countDocuments();
        const totalPages = Math.ceil(total / limit);

        return res.json({
            courses,
            page,
            totalPages,
            totalCourses: total
        });
    } catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving courses", 
            message: err.message 
        });
    }
}

// קבלת קורס לפי ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // בדיקת תקינות MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                title: "invalid id", 
                message: "invalid course id format" 
            });
        }

        let course = await courseModel.findById(id).lean();
        
        if (!course)
            return res.status(404).json({ 
                title: "no such course", 
                message: "course not found" 
            });

        return res.json(course);
    } catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving course", 
            message: err.message 
        });
    }
}

// הוספת קורס חדש
export const addNewCourse = async (req, res) => {
    try {
        if (!req.body)
            return res.status(400).json({ 
                title: "missing body", 
                message: "no data" 
            });

        let { name, price, numLessons, imgUrl } = req.body;

        if (!name || !price || !numLessons || !imgUrl)
            return res.status(400).json({ 
                title: "missing data", 
                message: "name, price, numLessons, imgUrl are required" 
            });

        if (price <= 0)
            return res.status(400).json({ 
                title: "invalid data", 
                message: "price must be greater than 0" 
            });

        if (numLessons <= 0)
            return res.status(400).json({ 
                title: "invalid data", 
                message: "numLessons must be greater than 0" 
            });

        // בדיקת כפילות לפי שם בלבד
        const already = await courseModel.findOne({ name });
        if (already)
            return res.status(409).json({ 
                title: "duplicate course", 
                message: "a course with this name already exists" 
            });

        const newCourse = new courseModel({ name, price, numLessons, imgUrl });
        let course = await newCourse.save();
        
        return res.status(201).json(course);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error adding new course", 
            message: err.message 
        });
    }
}

// עדכון קורס
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        
        // בדיקת תקינות MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                title: "invalid id", 
                message: "invalid course id format" 
            });
        }

        let { name, price, numLessons, imgUrl } = req.body;

        let updateObject = {};
        
        if (name !== undefined) {
            // בדיקה שאין קורס אחר עם אותו שם
            const existing = await courseModel.findOne({ name, _id: { $ne: id } });
            if (existing)
                return res.status(409).json({ 
                    title: "duplicate name", 
                    message: "another course with this name already exists" 
                });
            updateObject.name = name;
        }

        if (price !== undefined) {
            if (price <= 0)
                return res.status(400).json({ 
                    title: "invalid data", 
                    message: "price must be greater than 0" 
                });
            updateObject.price = price;
        }

        if (numLessons !== undefined) {
            if (numLessons <= 0) 
                return res.status(400).json({ 
                    title: "invalid data", 
                    message: "numLessons must be greater than 0" 
                });
            updateObject.numLessons = numLessons;
        }

        if (imgUrl !== undefined) 
            updateObject.imgUrl = imgUrl;

        if (Object.keys(updateObject).length === 0)
            return res.status(400).json({ 
                title: "no data to update", 
                message: "no fields provided for update" 
            });

        let course = await courseModel.findByIdAndUpdate(
            id, 
            updateObject, 
            { new: true }
        );

        if (!course)
            return res.status(404).json({ 
                title: "error updating", 
                message: "Course not found" 
            });

        return res.json(course);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error updating course", 
            message: err.message 
        });
    }
}

// עדכון סטטוס רכישה של קורס
export const updatePurchasableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // בדיקת תקינות MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                title: "invalid id", 
                message: "invalid course id format" 
            });
        }

        const course = await courseModel.findById(id);
        if (!course) {
            return res.status(404).json({ 
                title: "error updating", 
                message: "Course not found" 
            });
        }

        course.isPurchasable = !course.isPurchasable;
        await course.save();
        
        res.json(course);
    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error updating course", 
            message: err.message 
        });
    }
}