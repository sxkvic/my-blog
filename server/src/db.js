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
const DEFAULT_USER_NAME = process.env.DEFAULT_USER || 'user';
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || 'user123456';

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

function mapMemoTask(row) {
  return {
    id: row.id,
    title: row.title,
    details: row.details,
    date: row.date,
    priority: row.priority,
    status: row.status,
    category: row.category,
  };
}

const memoSeedTasks = [];

function hasColumn(table, column) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some((row) => row.name === column);
}

function ensureColumn(table, column, definition) {
  if (!hasColumn(table, column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function canAccessOwner(auth, ownerUserId) {
  if (!auth) {
    return false;
  }
  if (auth.role === 'admin') {
    return true;
  }
  return auth.userId === ownerUserId;
}

function ensureDefaultUsers() {
  const adminRow = db.prepare('SELECT id FROM users WHERE username = ?').get(DEFAULT_ADMIN_USER);
  if (!adminRow) {
    db.prepare(`
      INSERT INTO users (username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, 'admin', datetime('now'), datetime('now'))
    `).run(DEFAULT_ADMIN_USER, hashPassword(DEFAULT_ADMIN_PASSWORD));
  }

  const userRow = db.prepare('SELECT id FROM users WHERE username = ?').get(DEFAULT_USER_NAME);
  if (!userRow) {
    db.prepare(`
      INSERT INTO users (username, password_hash, role, created_at, updated_at)
      VALUES (?, ?, 'user', datetime('now'), datetime('now'))
    `).run(DEFAULT_USER_NAME, hashPassword(DEFAULT_USER_PASSWORD));
  }

  return db.prepare('SELECT id FROM users WHERE username = ?').get(DEFAULT_ADMIN_USER).id;
}

function migrateFromLegacyJson(adminUserId) {
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
        published_at, read_time, featured, views, content_json, media_json, created_by_user, owner_user_id
      ) VALUES (
        @slug, @title, @excerpt, @channel, @category, @tags_json, @author_id,
        @published_at, @read_time, @featured, @views, @content_json, @media_json, @created_by_user, @owner_user_id
      )
    `);

    const insertGame = db.prepare(`
      INSERT INTO game_accounts (
        id, game, server, account, password, role, last_login, notes, owner_user_id
      ) VALUES (
        @id, @game, @server, @account, @password, @role, @last_login, @notes, @owner_user_id
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
          owner_user_id: adminUserId,
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
          owner_user_id: adminUserId,
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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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
      owner_user_id INTEGER,
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
      owner_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS memo_tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      date TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      category TEXT NOT NULL,
      owner_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  ensureColumn('posts', 'owner_user_id', 'INTEGER');
  ensureColumn('game_accounts', 'owner_user_id', 'INTEGER');
  ensureColumn('memo_tasks', 'owner_user_id', 'INTEGER');

  const adminUserId = ensureDefaultUsers();

  const adminRow = db.prepare('SELECT id FROM admin_auth WHERE id = 1').get();
  if (!adminRow) {
    db.prepare(`
      INSERT INTO admin_auth (id, username, password_hash, updated_at)
      VALUES (1, ?, ?, datetime('now'))
    `).run(DEFAULT_ADMIN_USER, hashPassword(DEFAULT_ADMIN_PASSWORD));
  }

  migrateFromLegacyJson(adminUserId);

  db.prepare('UPDATE posts SET owner_user_id = ? WHERE owner_user_id IS NULL').run(adminUserId);
  db.prepare('UPDATE game_accounts SET owner_user_id = ? WHERE owner_user_id IS NULL').run(adminUserId);
  db.prepare('UPDATE memo_tasks SET owner_user_id = ? WHERE owner_user_id IS NULL').run(adminUserId);

  const memoCount = db.prepare('SELECT COUNT(*) AS count FROM memo_tasks').get().count;
  if (memoCount === 0) {
    const insertMemo = db.prepare(`
      INSERT INTO memo_tasks (
        id, title, details, date, priority, status, category, owner_user_id
      ) VALUES (
        @id, @title, @details, @date, @priority, @status, @category, @owner_user_id
      )
    `);

    const tx = db.transaction(() => {
      for (const task of memoSeedTasks) {
        insertMemo.run({ ...task, owner_user_id: adminUserId });
      }
    });

    tx();
  }
}

export function listPosts() {
  const rows = db.prepare('SELECT * FROM posts ORDER BY published_at DESC, created_at DESC').all();
  return rows.map(mapPost);
}

export function findPostBySlug(slug) {
  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
  return row ? mapPost(row) : null;
}

function findPostRowBySlug(slug) {
  return db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);
}

export function createPost(post) {
  db.prepare(`
    INSERT INTO posts (
      slug, title, excerpt, channel, category, tags_json, author_id,
      published_at, read_time, featured, views, content_json, media_json, created_by_user, owner_user_id
    ) VALUES (
      @slug, @title, @excerpt, @channel, @category, @tags_json, @author_id,
      @published_at, @read_time, @featured, @views, @content_json, @media_json, @created_by_user, @owner_user_id
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
    owner_user_id: post.ownerUserId,
  });

  return findPostBySlug(post.slug);
}

export function updatePost(slug, payload, auth) {
  const currentRow = findPostRowBySlug(slug);
  if (!currentRow || !canAccessOwner(auth, currentRow.owner_user_id)) {
    return null;
  }

  const current = mapPost(currentRow);
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

export function deletePost(slug, auth) {
  const row = findPostRowBySlug(slug);
  if (!row || !canAccessOwner(auth, row.owner_user_id)) {
    return false;
  }

  const result = db.prepare('DELETE FROM posts WHERE slug = ?').run(slug);
  return result.changes > 0;
}

export function listGameAccounts(auth) {
  if (auth?.role === 'admin') {
    const rows = db.prepare('SELECT * FROM game_accounts ORDER BY created_at DESC').all();
    return rows.map(mapGameAccount);
  }

  const rows = db
    .prepare('SELECT * FROM game_accounts WHERE owner_user_id = ? ORDER BY created_at DESC')
    .all(auth.userId);
  return rows.map(mapGameAccount);
}

function findGameAccountRowById(id) {
  return db.prepare('SELECT * FROM game_accounts WHERE id = ?').get(id);
}

export function findGameAccountById(id) {
  const row = findGameAccountRowById(id);
  return row ? mapGameAccount(row) : null;
}

export function createGameAccount(account) {
  db.prepare(`
    INSERT INTO game_accounts (
      id, game, server, account, password, role, last_login, notes, owner_user_id
    ) VALUES (
      @id, @game, @server, @account, @password, @role, @last_login, @notes, @owner_user_id
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
    owner_user_id: account.ownerUserId,
  });

  return findGameAccountById(account.id);
}

export function updateGameAccount(id, payload, auth) {
  const currentRow = findGameAccountRowById(id);
  if (!currentRow || !canAccessOwner(auth, currentRow.owner_user_id)) {
    return null;
  }

  const current = mapGameAccount(currentRow);
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

export function deleteGameAccount(id, auth) {
  const row = findGameAccountRowById(id);
  if (!row || !canAccessOwner(auth, row.owner_user_id)) {
    return false;
  }

  const result = db.prepare('DELETE FROM game_accounts WHERE id = ?').run(id);
  return result.changes > 0;
}

export function listMemoTasks(auth) {
  if (auth?.role === 'admin') {
    const rows = db.prepare('SELECT * FROM memo_tasks ORDER BY date ASC, created_at DESC').all();
    return rows.map(mapMemoTask);
  }

  const rows = db
    .prepare('SELECT * FROM memo_tasks WHERE owner_user_id = ? ORDER BY date ASC, created_at DESC')
    .all(auth.userId);
  return rows.map(mapMemoTask);
}

function findMemoTaskRowById(id) {
  return db.prepare('SELECT * FROM memo_tasks WHERE id = ?').get(id);
}

export function findMemoTaskById(id) {
  const row = findMemoTaskRowById(id);
  return row ? mapMemoTask(row) : null;
}

export function createMemoTask(task) {
  db.prepare(`
    INSERT INTO memo_tasks (
      id, title, details, date, priority, status, category, owner_user_id
    ) VALUES (
      @id, @title, @details, @date, @priority, @status, @category, @owner_user_id
    )
  `).run({
    id: task.id,
    title: task.title,
    details: task.details,
    date: task.date,
    priority: task.priority,
    status: task.status,
    category: task.category,
    owner_user_id: task.ownerUserId,
  });

  return findMemoTaskById(task.id);
}

export function updateMemoTask(id, payload, auth) {
  const currentRow = findMemoTaskRowById(id);
  if (!currentRow || !canAccessOwner(auth, currentRow.owner_user_id)) {
    return null;
  }

  const current = mapMemoTask(currentRow);
  const merged = { ...current, ...payload, id };

  db.prepare(`
    UPDATE memo_tasks SET
      title = @title,
      details = @details,
      date = @date,
      priority = @priority,
      status = @status,
      category = @category,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({
    id,
    title: merged.title,
    details: merged.details,
    date: merged.date,
    priority: merged.priority,
    status: merged.status,
    category: merged.category,
  });

  return findMemoTaskById(id);
}

export function deleteMemoTask(id, auth) {
  const row = findMemoTaskRowById(id);
  if (!row || !canAccessOwner(auth, row.owner_user_id)) {
    return false;
  }

  const result = db.prepare('DELETE FROM memo_tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function findUserByUsername(username) {
  return db.prepare('SELECT id, username, role, password_hash FROM users WHERE username = ?').get(username);
}

export function verifyUserCredentials(username, password) {
  const row = findUserByUsername(username);
  if (!row) {
    return null;
  }

  if (!verifyPassword(password, row.password_hash)) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    role: row.role,
  };
}

export function updateUserPassword(userId, currentPassword, nextPassword) {
  const row = db.prepare('SELECT id, password_hash FROM users WHERE id = ?').get(userId);
  if (!row) {
    return { ok: false, reason: 'user_not_found' };
  }

  if (!verifyPassword(currentPassword, row.password_hash)) {
    return { ok: false, reason: 'invalid_current_password' };
  }

  db.prepare(`
    UPDATE users
    SET password_hash = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(hashPassword(nextPassword), userId);

  return { ok: true };
}

export function listUsers(auth) {
  if (auth?.role !== 'admin') {
    return [];
  }

  return db
    .prepare("SELECT id, username, role, created_at AS createdAt FROM users ORDER BY id ASC")
    .all();
}

export function createUser(payload, auth) {
  if (auth?.role !== 'admin') {
    return null;
  }

  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  const role = payload.role === 'admin' ? 'admin' : 'user';

  if (!username || password.length < 8) {
    return { error: 'invalid_input' };
  }

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return { error: 'username_exists' };
  }

  const result = db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `).run(username, hashPassword(password), role);

  return {
    id: Number(result.lastInsertRowid),
    username,
    role,
  };
}

export function registerUser(payload) {
  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');

  if (!username || password.length < 8) {
    return { error: 'invalid_input' };
  }

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) {
    return { error: 'username_exists' };
  }

  const result = db.prepare(`
    INSERT INTO users (username, password_hash, role, created_at, updated_at)
    VALUES (?, ?, 'user', datetime('now'), datetime('now'))
  `).run(username, hashPassword(password));

  return {
    id: Number(result.lastInsertRowid),
    username,
    role: 'user',
  };
}

// Legacy compatibility helpers.
export function verifyAdminCredentials(username, password) {
  const user = verifyUserCredentials(username, password);
  return Boolean(user);
}

export function updateAdminPassword(username, currentPassword, nextPassword) {
  const user = findUserByUsername(username);
  if (!user) {
    return { ok: false, reason: 'user_not_found' };
  }
  return updateUserPassword(user.id, currentPassword, nextPassword);
}
