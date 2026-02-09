import { createRouter, createWebHistory } from 'vue-router';
import AboutView from '../views/AboutView.vue';
import BlogListView from '../views/BlogListView.vue';
import BlogPostView from '../views/BlogPostView.vue';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Northline Journal' },
    },
    {
      path: '/blog',
      name: 'blog',
      component: BlogListView,
      meta: { title: 'Articles | Northline Journal' },
    },
    {
      path: '/blog/:slug',
      name: 'blog-post',
      component: BlogPostView,
      meta: { title: 'Article | Northline Journal' },
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
      meta: { title: 'About | Northline Journal' },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/blog',
    },
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
