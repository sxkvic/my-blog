import { createRouter, createWebHistory } from 'vue-router';
import AboutView from '../views/AboutView.vue';
import BlogListView from '../views/BlogListView.vue';
import BlogPostView from '../views/BlogPostView.vue';
import GamesVaultView from '../views/GamesVaultView.vue';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import MemoView from '../views/MemoView.vue';
import ToolsView from '../views/ToolsView.vue';
import WriteView from '../views/WriteView.vue';
import { clearVaultToken, getVaultToken, setAuthUser, verifyVaultSession } from '../services/vaultAuthGateway';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Neo日志' } },
    { path: '/login', name: 'login', component: LoginView, meta: { title: '登录 | Neo日志' } },
    { path: '/blog', name: 'blog', component: BlogListView, meta: { title: '文章库 | Neo日志' } },
    { path: '/blog/:slug', name: 'blog-post', component: BlogPostView, meta: { title: '文章详情 | Neo日志' } },
    { path: '/write', name: 'write', component: WriteView, meta: { title: '写作台 | Neo日志', requiresAuth: true } },
    { path: '/memo', name: 'memo', component: MemoView, meta: { title: '备忘录 | Neo日志', requiresAuth: true } },
    { path: '/games', name: 'games', component: GamesVaultView, meta: { title: '游戏仓 | Neo日志', requiresAuth: true } },
    { path: '/tools', name: 'tools', component: ToolsView, meta: { title: '工具集 | Neo日志', requiresAuth: true } },
    { path: '/about', name: 'about', component: AboutView, meta: { title: '关于我 | Neo日志' } },
    { path: '/:pathMatch(.*)*', redirect: '/blog' },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title;
  }
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) {
    return true;
  }

  const token = getVaultToken();
  if (!token) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }

  try {
    const user = await verifyVaultSession(token);
    setAuthUser(user);
    return true;
  } catch {
    clearVaultToken();
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

export default router;
