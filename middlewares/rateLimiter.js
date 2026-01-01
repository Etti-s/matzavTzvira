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

// הגבלת הרשמות - 3 ניסיונות כל שעה
export const signUpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // שעה
    max: 3, // מקסימום 3 הרשמות לשעה מאותו IP
    message: {
        title: "Too many sign up attempts",
        message: "Too many accounts created from this IP, please try again after an hour"
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // רק ניסיונות כושלים נספרים
    handler: (req, res) => {
        res.status(429).json({
            title: "Too many sign up attempts",
            message: "Too many accounts created from this IP. Please try again later.",
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + " minutes"
        });
    }
});

// הגבלה כללית לכל ה-API - 100 בקשות לדקה
export const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // דקה
    max: 100, // מקסימום בקשות
    message: {
        title: "Too many requests",
        message: "Too many requests from this IP, please slow down"
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            title: "Too many requests",
            message: "You are making too many requests. Please slow down.",
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000) + " seconds"
        });
    }
});

// הגבלה מיוחדת ליצירת הזמנות - 10 הזמנות ל-10 דקות
export const orderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 דקות
    max: 10,
    message: {
        title: "Too many orders",
        message: "Too many orders created, please try again later"
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            title: "Too many orders",
            message: "You are creating too many orders. Please try again later.",
            retryAfter: Math.ceil(req.rateLimit.resetTime / 1000 / 60) + " minutes"
        });
    }
});
