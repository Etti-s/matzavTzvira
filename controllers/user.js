import { userModel } from "../models/user.js";
import { isStrongPassword, isValidEmail } from "../utils/validators.js";
import { hash, compare } from "bcryptjs";

// פונקציית עזר לבדיקת ObjectId
const isValidObjectId = (id) => {
    return id && id.match(/^[0-9a-fA-F]{24}$/);
};

// עבור המנהל - קבלת כל המשתמשים
export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // אפשר לסנן לפי סטטוס או להחזיר הכל
        const statusFilter = req.query.status === 'false' ? { status: false } : 
                            req.query.status === 'true' ? { status: true } : {};

        const users = await userModel
            .find(statusFilter, { password: 0 })
            .skip(skip)
            .limit(limit)

        const total = await userModel.countDocuments(statusFilter);
        const totalPages = Math.ceil(total / limit);

        return res.json({
            users,
            page,
            totalPages,
            totalUsers: total
        });
    } catch (err) {
        return res.status(500).json({ 
            title: "Error retrieving users", 
            message: err.message 
        });
    }
};

// הרשמה
export const signUp = async (req, res) => {
    try {
        if (!req.body)
            return res.status(400).json({ 
                title: "missing body", 
                message: "no data" 
            });

        let { username, password, email, profileImageUrl } = req.body;

        if (!username || !password || !email)
            return res.status(400).json({ 
                title: "missing data", 
                message: "username, password, email are required" 
            });

        // בדיקת אורך username
        if (username.trim().length < 2 || username.trim().length > 50)
            return res.status(400).json({ 
                title: "invalid username", 
                message: "username must be between 2-50 characters" 
            });

        // בדיקת תקינות אימייל
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                title: "invalid email", 
                message: "Email is not valid" 
            });
        }

        // בדיקת סיסמה
        if (!isStrongPassword(password)) {
            return res.status(400).json({
                title: "weak password",
                message: "Password must be at least 8 characters long and include uppercase, lowercase letters and numbers"
            });
        }

        // בדיקת כפילות
        const already = await userModel.findOne({ email: email.toLowerCase() });
        if (already)
            return res.status(409).json({ 
                title: "duplicate user", 
                message: "user with such email already exists" 
            });

        // הצפנת סיסמה 
        let hashedPassword = await hash(
            password, 
            parseInt(process.env.SALT_ROUNDS) || 10
        );

        const newUser = new userModel({ 
            username: username.trim(), 
            password: hashedPassword, 
            email: email.toLowerCase().trim(), 
            profileImageUrl 
        });

        const user = await newUser.save();

        let { password: _, ...other } = user.toObject();
        return res.status(201).json(other);

    } catch (err) {
        return res.status(500).json({ 
            title: "Error adding user", 
            message: err.message 
        });
    }
};

// כניסת משתמש
export const login = async (req, res) => {
    try {
        const { email, password: pass } = req.body;

        if (!email || !pass)
            return res.status(400).json({
                title: "missing data",
                message: "email and password are required"
            });

        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user)
            return res.status(401).json({
                title: "invalid credentials",
                message: "email or password is incorrect"
            });

        if (!user.status)
            return res.status(403).json({
                title: "user inactive",
                message: "Your account is inactive. Please contact support."
            });

        // השוואת סיסמה 
        const isMatch = await compare(pass, user.password);
        if (!isMatch)
            return res.status(401).json({
                title: "invalid credentials",
                message: "email or password is incorrect"
            });

        const { password, ...other } = user.toObject();
        return res.json(other);

    } catch (err) {
        return res.status(500).json({
            title: "Error logging in",
            message: err.message
        });
    }
};

// עדכון סיסמא
export const updatePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({
                title: "missing data",
                message: "userId, oldPassword and newPassword are required"
            });
        }

        // בדיקת תקינות userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                title: "invalid userId",
                message: "userId format is invalid"
            });
        }

        // בדיקת חוזק סיסמה חדשה
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({
                title: "weak password",
                message: "Password must be at least 8 characters long and include uppercase, lowercase letters and numbers"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                title: "user not found",
                message: "user not found"
            });
        }

        // בדיקת סיסמה נוכחית 
        const isMatch = await compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                title: "invalid password",
                message: "Current password is incorrect"
            });
        }

        // הצפנת הסיסמה החדשה 
        const hashedPassword = await hash(
            newPassword,
            parseInt(process.env.SALT_ROUNDS) || 10
        );

        user.password = hashedPassword;
        await user.save();

        return res.json({
            title: "success",
            message: "Password updated successfully"
        });

    } catch (err) {
        return res.status(500).json({
            title: "Error updating password",
            message: err.message
        });
    }
};

// עדכון כל הפרטים
export const updateDetails = async (req, res) => {
    try {
        const { userId, username, email, profileImageUrl } = req.body;

        if (!userId)
            return res.status(400).json({
                title: "missing data",
                message: "userId is required"
            });

        // בדיקת תקינות userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                title: "invalid userId",
                message: "userId format is invalid"
            });
        }

        const updateData = {};

        if (username !== undefined) {
            if (username.trim().length < 2 || username.trim().length > 50)
                return res.status(400).json({ 
                    title: "invalid username", 
                    message: "username must be between 2-50 characters" 
                });
            updateData.username = username.trim();
        }

        if (profileImageUrl !== undefined) 
            updateData.profileImageUrl = profileImageUrl;

        if (email !== undefined) {
            // בדיקת תקינות אימייל
            if (!isValidEmail(email)) {
                return res.status(400).json({ 
                    title: "invalid email", 
                    message: "Email is not valid" 
                });
            }
            // בדיקת כפילות אימייל (למעט המשתמש עצמו)
            const already = await userModel.findOne({ 
                email: email.toLowerCase(), 
                _id: { $ne: userId } 
            });
            if (already)
                return res.status(409).json({
                    title: "duplicate user",
                    message: "user with such email already exists"
                });

            updateData.email = email.toLowerCase().trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                title: "no data to update",
                message: "No fields were provided"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        );

        if (!updatedUser)
            return res.status(404).json({ 
                title: "user not found",
                message: "user not found"
            });

        const { password, ...other } = updatedUser.toObject();
        return res.json(other);

    }
    catch (err) {
        return res.status(500).json({ 
            title: "Error updating details", 
            message: err.message 
        });
    }
};

// עדכון סטטוס
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ 
                title: "missing data", 
                message: "userId is required" 
            });
        }

        // בדיקת תקינות userId
        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                title: "invalid userId",
                message: "userId format is invalid"
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                title: "user not found", 
                message: "No user with this id" 
            });
        }

        // הפיכת הסטטוס
        user.status = !user.status;
        await user.save();

        const { password, ...other } = user.toObject();
        return res.json(other);

    } catch (err) {
        return res.status(500).json({ 
            title: "Error updating status", 
            message: err.message 
        });
    }
};