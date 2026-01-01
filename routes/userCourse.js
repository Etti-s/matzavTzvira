import express from 'express';
import { 
    getUserActiveCourses, 
    getAllUserCourses, 
    canUserAccessCourse 
} from '../controllers/userCourse.js';

const router = express.Router();

router.get('/active/:userId', getUserActiveCourses);
router.get('/all/:userId', getAllUserCourses);
router.get('/access/:userId/:courseId', canUserAccessCourse);

export default router;