import type { BlogPost, Channel, PostMedia } from '../data/blog';

const STORAGE_KEY = 'neon-user-posts-v1';

export interface PostDraft {
  title: string;
  excerpt: string;
  channel: Channel;
  category: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  readTime: string;
  content: string[];
  media: PostMedia[];
}

function readPosts(): BlogPost[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as BlogPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePosts(posts: BlogPost[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function slugify(title: string) {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return normalized || `post-${Date.now()}`;
}

function uniqueSlug(base: string, posts: BlogPost[]) {
  let slug = base;
  let index = 1;

  while (posts.some((post) => post.slug === slug)) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export async function listUserPosts(): Promise<BlogPost[]> {
  return readPosts();
}

export async function createUserPost(draft: PostDraft): Promise<BlogPost> {
  const all = readPosts();
  const slug = uniqueSlug(slugify(draft.title), all);

  const created: BlogPost = {
    slug,
    title: draft.title,
    excerpt: draft.excerpt,
    channel: draft.channel,
    category: draft.category,
    tags: draft.tags,
    authorId: draft.authorId,
    publishedAt: draft.publishedAt,
    readTime: draft.readTime,
    featured: false,
    views: 0,
    content: draft.content,
    media: draft.media,
    createdByUser: true,
  };

  const next = [created, ...all];
  writePosts(next);
  return created;
}
