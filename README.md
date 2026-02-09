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
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `GET /api/auth/users` (admin)
- `POST /api/auth/users` (admin)
- `GET /api/posts`
- `POST /api/posts`
- `PUT /api/posts/:slug`
- `DELETE /api/posts/:slug`
- `GET /api/memo-tasks`
- `POST /api/memo-tasks`
- `PUT /api/memo-tasks/:id`
- `PATCH /api/memo-tasks/:id/status`
- `DELETE /api/memo-tasks/:id`
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

## 统一登录与数据隔离

首页公开访问；`写作台 / 备忘录 / 游戏仓` 需要登录后使用。

登录接口：`POST /api/auth/login`，返回 JWT。  
携带 `Authorization: Bearer <token>` 后：

- 普通账号只能访问自己创建的数据（文章写作操作、备忘录、游戏仓）
- `admin` 角色可以访问全部账号的数据

默认会初始化两个账号（首次建库时）：

- 管理员：`ADMIN_USER` / `ADMIN_PASSWORD`
- 普通用户：`DEFAULT_USER` / `DEFAULT_USER_PASSWORD`

请在部署前设置以下环境变量（不要使用默认值）：

- `ADMIN_USER`
- `ADMIN_PASSWORD`
- `DEFAULT_USER`
- `DEFAULT_USER_PASSWORD`
- `JWT_SECRET`

用户可在已登录状态下调用 `POST /api/auth/change-password` 修改自己的密码。
