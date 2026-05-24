import { Router } from 'express';
import { createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission, uploadMiddleware } from '../controllers/assignmentController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/', authorize('teacher'), createAssignment);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.put('/:id', authorize('teacher'), updateAssignment);
router.delete('/:id', authorize('teacher'), deleteAssignment);
router.post('/:id/submit', authorize('student'), uploadMiddleware, submitAssignment);
router.get('/:id/submissions', getSubmissions);
router.put('/:id/grade/:subId', authorize('teacher'), gradeSubmission);

export default router;
