import { Router, Request, Response } from 'express';
const router = Router();

// Mock model list
router.get('/', (_req: Request, res: Response) => {
  res.json({ models: ['gpt-3.5-turbo', 'gpt-4', 'mock-model'] });
});

export default router;
