import { Router } from 'express';
import { chat, generateQuiz, summarize, analyzePerformance, getYouTubeRecommendations } from '../controllers/aiController.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

router.post('/chat', chat);
router.post('/generate-quiz', generateQuiz);
router.post('/summarize', summarize);
router.post('/analyze-performance', analyzePerformance);
router.get('/videos/recommend', getYouTubeRecommendations);

export default router;
