import express from 'express';
import { createPost, deletePost, findPostBySlug, listPosts, updatePost } from './db.js';
import { requireAuth } from './auth.js';

const router = express.Router();

function slugify(title) {
  const normalized = String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || `post-${Date.now()}`;
}

function uniqueSlug(base) {
  let slug = base;
  let index = 1;

  while (findPostBySlug(slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

router.get('/', (_req, res) => {
  res.json(listPosts());
});

router.post('/', requireAuth, (req, res) => {
  const draft = req.body ?? {};

  if (!draft.title || !draft.excerpt || !Array.isArray(draft.content)) {
    return res.status(400).json({ message: 'title/excerpt/content 为必填字段' });
  }

  const slug = uniqueSlug(slugify(draft.title));
  const created = createPost({
    slug,
    title: draft.title,
    excerpt: draft.excerpt,
    channel: draft.channel || '技术心得',
    category: draft.category || '未分类',
    tags: Array.isArray(draft.tags) ? draft.tags : [],
    authorId: draft.authorId || 'kai',
    publishedAt: draft.publishedAt || new Date().toISOString().slice(0, 10),
    readTime: draft.readTime || '5 分钟',
    featured: Boolean(draft.featured),
    views: Number(draft.views || 0),
    content: draft.content,
    media: Array.isArray(draft.media) ? draft.media : [],
    createdByUser: true,
    ownerUserId: req.auth.userId,
  });

  return res.status(201).json(created);
});

router.put('/:slug', requireAuth, (req, res) => {
  const { slug } = req.params;
  const payload = req.body ?? {};

  const updated = updatePost(slug, payload, req.auth);
  if (!updated) {
    return res.status(404).json({ message: '文章不存在或无权限' });
  }

  return res.json(updated);
});

router.delete('/:slug', requireAuth, (req, res) => {
  const { slug } = req.params;
  const deleted = deletePost(slug, req.auth);

  if (!deleted) {
    return res.status(404).json({ message: '文章不存在或无权限' });
  }

  return res.status(204).send();
});

export default router;
