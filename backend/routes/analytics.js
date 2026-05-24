import { Router } from 'express';
import { getClassAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.get('/class/:classId', authorize('teacher', 'admin'), getClassAnalytics);
router.get('/student/:studentId?', getStudentAnalytics);

export default router;
