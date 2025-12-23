import express from "express";
import * as userController from "../controllers/user.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get('/', userController.getAllUsers);
router.post('/', userController.signUp);
router.post("/login", loginLimiter, userController.login);
router.put('/updatePassword', userController.updatePassword);
router.put('/update', userController.updateDetails);
router.put('/changeStatus', userController.toggleUserStatus);

export default router;
