import express from 'express';


import {getCourses,getCourseById,addNewCourse,updateCourse,updatePurchasableStatus}from "../controllers/course.js";

const router = express.Router();
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.post('/', addNewCourse);
router.put('/:id', updateCourse);
router.put('/:id/purchasable', updatePurchasableStatus);

export default router;
