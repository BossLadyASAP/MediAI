import { Router, Request, Response } from 'express';
const router = Router();

// Mock send message
router.post('/send', (_req: Request, res: Response) => {
  res.json({ response: 'This is a mocked AI response.' });
});

// Mock get history
router.get('/history', (_req: Request, res: Response) => {
  res.json({ history: [{ id: '1', title: 'Conversation 1' }] });
});

// Mock delete conversation
router.delete('/history/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Conversation deleted' });
});

// Mock rename conversation
router.put('/history/:id', (_req: Request, res: Response) => {
  res.json({ message: 'Conversation renamed' });
});

export default router;
