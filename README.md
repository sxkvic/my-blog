# my-blog

前端：Vue 3 + Vite  
后端：Node.js + Express（`server/`）
数据库：SQLite（单文件）

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 启动后端 API（默认 `3000`）

```bash
npm run api:dev
```

3. 新开终端，启动前端（默认 `5173`）

```bash
npm run dev
```

说明：Vite 已配置 `/api` 代理到 `http://127.0.0.1:3000`。

## API 概览

- `GET /api/health`
- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/posts/:slug`
- `DELETE /api/posts/:slug`
- `GET /api/game-accounts`
- `POST /api/game-accounts`
- `PUT /api/game-accounts/:id`
- `DELETE /api/game-accounts/:id`

## 腾讯云部署（Ubuntu + Nginx + PM2）

1. 安装 Node.js（建议 20+）和 PM2

```bash
npm i -g pm2
```

2. 上传项目到服务器，例如：`/var/www/my-blog`

3. 安装依赖并构建前端

```bash
cd /var/www/my-blog
npm install
npm run build
```

4. 启动后端服务

```bash
pm2 start server/src/index.js --name neon-blog-api
pm2 save
pm2 startup
```

5. 配置 Nginx

- 将仓库中的 `nginx.conf` 内容应用到你的站点配置（注意 `root` 路径）。
- `/api/` 已反代到 `127.0.0.1:3000`。

6. 重载 Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 数据存储

当前后端使用 SQLite 文件：`server/data/app.db`。

- 如果存在旧的 `server/data/db.json`，后端首次启动时会自动尝试迁移数据。
- 你不需要安装 MySQL，也不需要单独配置数据库服务。

后续如果你要升级到 MySQL/PostgreSQL，主要替换点是 `server/src/db.js`。
