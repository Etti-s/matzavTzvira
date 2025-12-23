import { courseModel } from "../models/course.js"

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
        return res.status(500).json({ title: "Error retrieving courses", message: err });
    }

}
// קבלת קורס לפי ID
export const getCourseById = async (req, res) => {
    try {
        const { id } = req.params
        let course = await courseModel.findOne({ id })
        if (!course)
            return res.status(404).json({ title: "no such course", message: "course not found" })

        return res.json(course)
    } catch (err) {
        return res.status(500).json({ title: "Error retrieving course", message: err })
    }

}
// הוספת קורס חדש
export const addNewCourse = async (req, res) => {//פונקציה זו לא מחייבת קבלת שיעורים ואורכם אלא יוצרת קורס גם ללא שיעורים
    try {
        if (!req.body)
            return res.status(400).json({ title: "missing body", message: "no data" })
        let { name, price, numLessons, imgUrl } = req.body
        if (!name || !price || !numLessons || !imgUrl)
            return res.status(400).json({ title: "missing data", message: "name, price, numLessons,imgUrl  are required" })
        if (price < 0)
            return res.status(400).json({ title: "invalid data", message: "price must be greater than 0" })

        const already = await courseModel.findOne({ name, price })
        if (already)
            return res.status(409).json({ title: "duplicate course", message: "a course with the same name and price already exists" })
        const newCourse = new courseModel({ name, price, numLessons, imgUrl })
        let course = await newCourse.save()
        return res.status(201).json(course)
    }
    catch (err) {
        return res.status(500).json({ title: "Error adding new course", message: err })
    }

}
// עדכון קורס
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params
        let { name, price, numLessons, imgUrl } = req.body

        let updateObject = {}
        if (name !== undefined) updateObject.name = name
        if (price !== undefined) {
            if (price < 0)
                return res.status(400).json({ title: "invalid data", message: "price must be greater than 0" })
            updateObject.price = price
        }
        if (numLessons !== undefined) {
            if (numLessons < 0) return res.status(400).json({ title: "invalid data", message: "numLessons must be greater than 0" });
            updateObject.numLessons = numLessons;
        } if (imgUrl !== undefined) updateObject.imgUrl = imgUrl


        let course = await courseModel.findByIdAndUpdate(id, updateObject, { new: true })
        if (!course)

            return res.status(404).json({ title: "error updating", message: "Course not found" })

        return res.json(course)
    }
    catch (err) {
        return res.status(500).json({ title: "Error updating course", message: err })
    }
}
// עדכון סטטוס-רכישה של קורס
export const updatePurchasableStatus = async (req, res) => {//באוטומט. isPurchasable פונקציה המקבלת איי דיי ומשנה את ערך 
    try {
        const { id } = req.params
        const course = await courseModel.findById(id);
        if (!course) {
            return res.status(404).json({ title: "error updating", message: "Course not found" });
        }

        course.isPurchasable = !course.isPurchasable;
        await course.save();
        res.json(course);
    }
    catch (err) {
        return res.status(500).json({ title: "Error updating course", message: err })
    }
};
