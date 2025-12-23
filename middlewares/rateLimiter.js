import rateLimit from "express-rate-limit";

// הגבלת כניסות ל-5 ניסיונות כל 15 דקות
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 דקות
    max: 5, // מקסימום ניסיונות
    message: {
        title: "Too many login attempts",
        message: "Please try again after 15 minutes"
    },
    standardHeaders: true,
    legacyHeaders: false,
});
