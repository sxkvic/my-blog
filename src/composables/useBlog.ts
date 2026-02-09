import { computed, ref } from 'vue';
import {
  authors,
  gameAccounts,
  posts as seedPosts,
  siteData,
  siteStats as seedStats,
  type BlogPost,
  type Channel,
} from '../data/blog';
import {
  createUserPost,
  deleteUserPost,
  listUserPosts,
  type PostDraft,
  updateUserPost,
} from '../services/postGateway';

const initialized = ref(false);
const userPosts = ref<BlogPost[]>([]);

async function init() {
  if (initialized.value) {
    return;
  }

  try {
    userPosts.value = await listUserPosts();
  } catch {
    userPosts.value = [];
  }

  initialized.value = true;
}

const allPosts = computed(() => {
  return [...userPosts.value, ...seedPosts].sort(
    (a, b) => new Date(b.publishedAt).valueOf() - new Date(a.publishedAt).valueOf()
  );
});

const featuredPosts = computed(() => {
  const featured = allPosts.value.filter((post) => post.featured);
  return featured.length ? featured : allPosts.value.slice(0, 2);
});

const categories = computed(() => [...new Set(allPosts.value.map((post) => post.category))]);
const popularTags = computed(() => [...new Set(allPosts.value.flatMap((post) => post.tags))].slice(0, 10));

const stats = computed(() => ({
  ...seedStats,
  totalArticles: allPosts.value.length,
}));

function getPostBySlug(slug: string) {
  return allPosts.value.find((post) => post.slug === slug);
}

function getRelatedPosts(slug: string, channel: Channel) {
  return allPosts.value
    .filter((post) => post.slug !== slug && post.channel === channel)
    .slice(0, 3);
}

async function publishPost(draft: PostDraft) {
  const created = await createUserPost(draft);
  userPosts.value = [created, ...userPosts.value];
  return created;
}

async function savePost(slug: string, payload: Partial<BlogPost>) {
  const updated = await updateUserPost(slug, payload);
  userPosts.value = userPosts.value.map((item) => (item.slug === slug ? updated : item));
  return updated;
}

async function removePost(slug: string) {
  await deleteUserPost(slug);
  userPosts.value = userPosts.value.filter((item) => item.slug !== slug);
}

init();

export function useBlog() {
  return {
    init,
    allPosts,
    featuredPosts,
    categories,
    popularTags,
    stats,
    getPostBySlug,
    getRelatedPosts,
    publishPost,
    savePost,
    removePost,
    siteData,
    authors,
    gameAccounts,
  };
}
