import { Router, Request, Response } from 'express';
const router = Router();

// Mock file upload
router.post('/upload', (_req: Request, res: Response) => {
  res.json({ fileUrl: '/mock/path/file.txt' });
});

// Mock file download
router.get('/download/:filename', (req: Request, res: Response) => {
  res.download('mock/path/' + req.params.filename);
});

export default router;
