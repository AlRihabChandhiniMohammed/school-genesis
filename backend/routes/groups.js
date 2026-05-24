import { Router } from 'express';
import { autoGenerateGroups, getGroups, updateGroup } from '../controllers/groupController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/auto-generate/:classId', authorize('teacher'), autoGenerateGroups);
router.get('/class/:classId', authorize('teacher'), getGroups);
router.put('/:id', authorize('teacher'), updateGroup);

export default router;
