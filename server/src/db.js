import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { hashPassword, verifyPassword } from './password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = process.env.DB_FILE || path.resolve(__dirname, '../data/app.db');
const LEGACY_JSON = path.resolve(__dirname, '../data/db.json');
const DEFAULT_ADMIN_USER = process.env.ADMIN_USER || 'admin';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';

const db = new Database(DB_FILE);

function parseArray(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapPost(row) {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    channel: row.channel,
    category: row.category,
    tags: parseArray(row.tags_json),
    authorId: row.author_id,
    publishedAt: row.published_at,
    readTime: row.read_time,
    featured: Boolean(row.featured),
    views: Number(row.views || 0),
    content: parseArray(row.content_json),
    media: parseArray(row.media_json),
    createdByUser: Boolean(row.created_by_user),
  };
}

function mapGameAccount(row) {
  return {
    id: row.id,
    game: row.game,
    server: row.server,
    account: row.account,
    password: row.password,
    role: row.role,
    lastLogin: row.last_login,
    notes: row.notes,
  };
}

function migrateFromLegacyJson() {
  const postCount = db.prepare('SELECT COUNT(*) AS count FROM posts').get().count;
  const accountCount = db.prepare('SELECT COUNT(*) AS count FROM game_accounts').get().count;

  if ((postCount > 0 || accountCount > 0) || !fs.existsSync(LEGACY_JSON)) {
    return;
  }

  try {
    const raw = fs.readFileSync(LEGACY_JSON, 'utf8');
    const legacy = JSON.parse(raw);

    const insertPost = db.prepare(`
      INSERT INTO posts (
        slug, title, excerpt, channel, category, tags_json, author_id,
        published_at, read_time, featured, views, content_json, media_json, created_by_user
      ) VALUES (
        @slug, @title, @excerpt, @channel, @category, @tags_json, @author_id,
        @published_at, @read_time, @featured, @views, @content_json, @media_json, @created_by_user
      )
    `);

    const insertGame = db.prepare(`
      INSERT INTO game_accounts (
        id, game, server, account, password, role, last_login, notes
      ) VALUES (
        @id, @game, @server, @account, @password, @role, @last_login, @notes
      )
    `);

    const tx = db.transaction(() => {
      for (const post of Array.isArray(legacy.posts) ? legacy.posts : []) {
        insertPost.run({
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          channel: post.channel || '技术心得',
          category: post.category || '未分类',
          tags_json: JSON.stringify(Array.isArray(post.tags) ? post.tags : []),
          author_id: post.authorId || 'kai',
          published_at: post.publishedAt || new Date().toISOString().slice(0, 10),
          read_time: post.readTime || '5 分钟',
          featured: post.featured ? 1 : 0,
          views: Number(post.views || 0),
          content_json: JSON.stringify(Array.isArray(post.content) ? post.content : []),
          media_json: JSON.stringify(Array.isArray(post.media) ? post.media : []),
          created_by_user: post.createdByUser ? 1 : 0,
        });
      }

      for (const account of Array.isArray(legacy.gameAccounts) ? legacy.gameAccounts : []) {
        insertGame.run({
          id: account.id,
          game: account.game,
          server: account.server || '未填写',
          account: account.account,
          password: account.password,
          role: account.role || '未分类',
          last_login: account.lastLogin || new Date().toISOString().slice(0, 10),
          notes: account.notes || '暂无心得',
        });
      }
    });

    tx();
  } catch {
    // ignore legacy migration errors
  }
}

export function initDb() {
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      channel TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      author_id TEXT NOT NULL,
      published_at TEXT NOT NULL,
      read_time TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      views INTEGER NOT NULL DEFAULT 0,
      content_json TEXT NOT NULL,
      media_json TEXT NOT NULL,
      created_by_user INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS game_accounts (
      id TEXT PRIMARY KEY,
      game TEXT NOT NULL,
      server TEXT NOT NULL,
      account TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      last_login TEXT NOT NULL,
      notes TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const adminRow = db.prepare('SELECT id FROM admin_auth WHERE id = 1').get();
  if (!adminRow) {
    db.prepare(`
      INSERT INTO admin_auth (id, username, password_hash, updated_at)
      VALUES (1, ?, ?, datetime('now'))
    `).run(DEFAULT_ADMIN_USER, hashPassword(DEFAULT_ADMIN_PASSWORD));
  }

  migrateFromLegacyJson();
}

export function listPosts() {
  const rows = db.prepare('SELECT * FROM posts ORDER BY published_at DESC, created_at DESC').all();
  return rows.map(mapPost);
}

export function findPostBySlug(slug) {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  return row ? mapPost(row) : null;
}

export function createPost(post) {
  db.prepare(`
    INSERT INTO posts (
      slug, title, excerpt, channel, category, tags_json, author_id,
      published_at, read_time, featured, views, content_json, media_json, created_by_user
    ) VALUES (
      @slug, @title, @excerpt, @channel, @category, @tags_json, @author_id,
      @published_at, @read_time, @featured, @views, @content_json, @media_json, @created_by_user
    )
  `).run({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    channel: post.channel,
    category: post.category,
    tags_json: JSON.stringify(post.tags || []),
    author_id: post.authorId,
    published_at: post.publishedAt,
    read_time: post.readTime,
    featured: post.featured ? 1 : 0,
    views: Number(post.views || 0),
    content_json: JSON.stringify(post.content || []),
    media_json: JSON.stringify(post.media || []),
    created_by_user: post.createdByUser ? 1 : 0,
  });

  return findPostBySlug(post.slug);
}

export function updatePost(slug, payload) {
  const current = findPostBySlug(slug);
  if (!current) {
    return null;
  }

  const merged = { ...current, ...payload, slug: current.slug };

  db.prepare(`
    UPDATE posts SET
      title = @title,
      excerpt = @excerpt,
      channel = @channel,
      category = @category,
      tags_json = @tags_json,
      author_id = @author_id,
      published_at = @published_at,
      read_time = @read_time,
      featured = @featured,
      views = @views,
      content_json = @content_json,
      media_json = @media_json,
      created_by_user = @created_by_user,
      updated_at = datetime('now')
    WHERE slug = @slug
  `).run({
    slug: merged.slug,
    title: merged.title,
    excerpt: merged.excerpt,
    channel: merged.channel,
    category: merged.category,
    tags_json: JSON.stringify(merged.tags || []),
    author_id: merged.authorId,
    published_at: merged.publishedAt,
    read_time: merged.readTime,
    featured: merged.featured ? 1 : 0,
    views: Number(merged.views || 0),
    content_json: JSON.stringify(merged.content || []),
    media_json: JSON.stringify(merged.media || []),
    created_by_user: merged.createdByUser ? 1 : 0,
  });

  return findPostBySlug(slug);
}

export function deletePost(slug) {
  const result = db.prepare('DELETE FROM posts WHERE slug = ?').run(slug);
  return result.changes > 0;
}

export function listGameAccounts() {
  const rows = db.prepare('SELECT * FROM game_accounts ORDER BY created_at DESC').all();
  return rows.map(mapGameAccount);
}

export function findGameAccountById(id) {
  const row = db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(id);
  return row ? mapGameAccount(row) : null;
}

export function createGameAccount(account) {
  db.prepare(`
    INSERT INTO game_accounts (
      id, game, server, account, password, role, last_login, notes
    ) VALUES (
      @id, @game, @server, @account, @password, @role, @last_login, @notes
    )
  `).run({
    id: account.id,
    game: account.game,
    server: account.server,
    account: account.account,
    password: account.password,
    role: account.role,
    last_login: account.lastLogin,
    notes: account.notes,
  });

  return findGameAccountById(account.id);
}

export function updateGameAccount(id, payload) {
  const current = findGameAccountById(id);
  if (!current) {
    return null;
  }

  const merged = { ...current, ...payload, id };

  db.prepare(`
    UPDATE game_accounts SET
      game = @game,
      server = @server,
      account = @account,
      password = @password,
      role = @role,
      last_login = @last_login,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    game: merged.game,
    server: merged.server,
    account: merged.account,
    password: merged.password,
    role: merged.role,
    last_login: merged.lastLogin,
    notes: merged.notes,
  });

  return findGameAccountById(id);
}

export function deleteGameAccount(id) {
  const result = db.prepare('DELETE FROM game_accounts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function verifyAdminCredentials(username, password) {
  const row = db.prepare('SELECT username, password_hash FROM admin_auth WHERE id = 1').get();
  if (!row || row.username !== username) {
    return false;
  }
  return verifyPassword(password, row.password_hash);
}

export function updateAdminPassword(username, currentPassword, nextPassword) {
  const row = db.prepare('SELECT username, password_hash FROM admin_auth WHERE id = 1').get();
  if (!row || row.username !== username) {
    return { ok: false, reason: 'user_not_found' };
  }
  if (!verifyPassword(currentPassword, row.password_hash)) {
    return { ok: false, reason: 'invalid_current_password' };
  }

  db.prepare(`
    UPDATE admin_auth
    SET password_hash = ?, updated_at = datetime('now')
    WHERE id = 1
  `).run(hashPassword(nextPassword));

  return { ok: true };
}
