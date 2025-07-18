import { Router, Request, Response } from 'express';
const router = Router();

// Mock profile
router.get('/profile', (_req: Request, res: Response) => {
  res.json({ id: '1', email: 'user@example.com', name: 'Demo User' });
});

// Mock settings
router.get('/settings', (_req: Request, res: Response) => {
  res.json({ theme: 'light', language: 'en' });
});

router.put('/settings', (_req: Request, res: Response) => {
  res.json({ message: 'Settings updated' });
});

export default router;
