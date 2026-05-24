import { Router } from 'express';
import { getStats, getUsers, deleteUser, getSystemLogs } from '../controllers/adminController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();
router.use(auth);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/logs', getSystemLogs);

export default router;
