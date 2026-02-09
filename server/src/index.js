import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { requireVaultAuth } from './auth.js';
import authRouter from './auth.routes.js';
import { initDb } from './db.js';
import gameAccountsRouter from './gameAccounts.routes.js';
import memoRouter from './memo.routes.js';
import postsRouter from './posts.routes.js';
import toolsRouter from './tools.routes.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.CORS_ORIGIN || '*';

initDb();

app.use(cors({ origin }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('tiny'));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'neon-blog-api', db: 'sqlite' });
});

app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/memo-tasks', requireVaultAuth, memoRouter);
app.use('/api/game-accounts', requireVaultAuth, gameAccountsRouter);
app.use('/api/tools', requireVaultAuth, toolsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

app.listen(port, () => {
  console.log(`[api] listening on :${port}`);
});
