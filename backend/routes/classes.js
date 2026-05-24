import { Router } from 'express';
import { getClasses, getPublicClasses, createClass, getClass, updateClass, deleteClass, addStudents, getClassPerformanceGroups } from '../controllers/classController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/public', getPublicClasses);
router.use(auth);
router.get('/', getClasses);
router.post('/', authorize('teacher', 'admin'), createClass);
router.get('/:id', getClass);
router.get('/:id/performance-groups', authorize('teacher', 'admin'), getClassPerformanceGroups);
router.put('/:id', authorize('teacher', 'admin'), updateClass);
router.delete('/:id', authorize('teacher', 'admin'), deleteClass);
router.post('/:id/students', authorize('teacher', 'admin'), addStudents);

export default router;
