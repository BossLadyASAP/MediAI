import { Router, Request, Response } from 'express';
const router = Router();

// Mock login
router.post('/login', (req: Request, res: Response) => {
  res.json({ token: 'mock-jwt-token', user: { id: '1', email: req.body.email } });
});

// Mock signup
router.post('/signup', (req: Request, res: Response) => {
  res.json({ token: 'mock-jwt-token', user: { id: '2', email: req.body.email } });
});

// Mock logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});

// Mock password reset
router.post('/reset', (_req: Request, res: Response) => {
  res.json({ message: 'Password reset link sent' });
});

export default router;
