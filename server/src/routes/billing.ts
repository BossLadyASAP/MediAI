import { Router, Request, Response } from 'express';
const router = Router();

// Mock subscription
router.get('/subscription', (_req: Request, res: Response) => {
  res.json({ plan: 'free', status: 'active' });
});

// Mock update subscription
router.post('/subscription', (_req: Request, res: Response) => {
  res.json({ message: 'Subscription updated (mock)' });
});

export default router;
