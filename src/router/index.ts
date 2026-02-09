import { createRouter, createWebHistory } from 'vue-router';
import AboutView from '../views/AboutView.vue';
import BlogListView from '../views/BlogListView.vue';
import BlogPostView from '../views/BlogPostView.vue';
import GamesVaultView from '../views/GamesVaultView.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: '霓虹日志' } },
    { path: '/blog', name: 'blog', component: BlogListView, meta: { title: '文章库 | 霓虹日志' } },
    { path: '/blog/:slug', name: 'blog-post', component: BlogPostView, meta: { title: '文章详情 | 霓虹日志' } },
    { path: '/games', name: 'games', component: GamesVaultView, meta: { title: '游戏仓 | 霓虹日志' } },
    { path: '/about', name: 'about', component: AboutView, meta: { title: '关于我 | 霓虹日志' } },
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

export default router;
