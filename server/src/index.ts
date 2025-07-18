import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import modelsRoutes from './routes/models.js';
import userRoutes from './routes/user.js';
import billingRoutes from './routes/billing.js';
import filesRoutes from './routes/files.js';
import trackerRoutes from './routes/tracker.js';

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/models', modelsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/tracker', trackerRoutes);

app.get('/', (_req: import('express').Request, res: import('express').Response) => {
  res.send('ChatGPT Platform Clone Backend (Mocked)');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
