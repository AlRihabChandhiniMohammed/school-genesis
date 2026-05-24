import { Router } from 'express';
import { generateQuizAI, createQuiz, getQuizzes, getQuiz, updateQuiz, deleteQuiz, submitQuiz, getQuizResults } from '../controllers/quizController.js';
import { auth, authorize } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/generate', authorize('teacher'), generateQuizAI);
router.post('/', authorize('teacher'), createQuiz);
router.get('/', getQuizzes);
router.get('/:id', getQuiz);
router.put('/:id', authorize('teacher'), updateQuiz);
router.delete('/:id', authorize('teacher'), deleteQuiz);
router.post('/:id/submit', authorize('student'), submitQuiz);
router.get('/:id/results', getQuizResults);

export default router;
