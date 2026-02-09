export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  views: number;
}

export const siteData = {
  name: 'Northline Journal',
  tagline: 'Design, engineering, and practical growth notes for modern makers.',
  newsletterText: 'Join 28,000+ readers and get one useful issue every Friday.',
};

export const authors: Author[] = [
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    role: 'Editor in Chief',
    avatar: 'MC',
  },
  {
    id: 'liam-park',
    name: 'Liam Park',
    role: 'Product Writer',
    avatar: 'LP',
  },
  {
    id: 'sofia-lin',
    name: 'Sofia Lin',
    role: 'Design Lead',
    avatar: 'SL',
  },
];

export const posts: BlogPost[] = [
  {
    slug: 'editorial-systems-for-fast-teams',
    title: 'Editorial Systems for Fast Teams',
    excerpt: 'How small teams publish consistently without killing quality.',
    category: 'Workflow',
    tags: ['Operations', 'Publishing', 'Team'],
    authorId: 'maya-chen',
    publishedAt: '2026-01-28',
    readTime: '8 min read',
    featured: true,
    views: 4120,
    content: [
      'Most content teams fail because they optimize for volume before creating a repeatable system. A strong workflow starts with clear intent for each article.',
      'Build one lightweight brief template and force every idea through it. This narrows scope and helps each writer align on angle, audience, and expected output.',
      'Use editorial checkpoints with fixed owners. A short review loop protects quality while avoiding endless back and forth that slows shipping.',
      'Finally, run monthly retrospectives around outcomes, not output. Track what changed for readers, and remove formats that look busy but do not move core metrics.'
    ],
  },
  {
    slug: 'building-a-reader-first-homepage',
    title: 'Building a Reader First Homepage',
    excerpt: 'Design decisions that make blog homepages easier to scan and trust.',
    category: 'Design',
    tags: ['UX', 'Homepage', 'Content'],
    authorId: 'sofia-lin',
    publishedAt: '2026-01-22',
    readTime: '6 min read',
    featured: true,
    views: 3670,
    content: [
      'A homepage is not a gallery. It is a map. Readers should know where to go in under ten seconds.',
      'Lead with one editorial promise, then group content by reader intent. This is more useful than sorting by date alone.',
      'Use strong typography contrast for hierarchy. When titles and metadata blend together, users skim less and bounce more quickly.',
      'A newsletter block works better when it is contextual. Place it after a valuable section, so people subscribe after trust is created.'
    ],
  },
  {
    slug: 'ship-better-with-weekly-design-reviews',
    title: 'Ship Better with Weekly Design Reviews',
    excerpt: 'A practical review ritual that raises quality without slowing delivery.',
    category: 'Product',
    tags: ['Review', 'Team', 'Design'],
    authorId: 'sofia-lin',
    publishedAt: '2026-01-18',
    readTime: '7 min read',
    featured: false,
    views: 2940,
    content: [
      'Teams often treat design review as approval theater. It should be a decision engine with focused tradeoffs and clear outcomes.',
      'Cap each review at three decisions. This constraint keeps discussions tactical and lowers the chance of drifting into abstract critique.',
      'Record one sentence per decision and attach owner plus deadline. Captured accountability matters more than polished meeting notes.',
      'Over time, these compact reviews create shared taste and reduce rewrite cycles across design and engineering.'
    ],
  },
  {
    slug: 'content-analytics-that-actually-matter',
    title: 'Content Analytics that Actually Matter',
    excerpt: 'A simple scorecard for measuring impact beyond page views.',
    category: 'Growth',
    tags: ['Analytics', 'SEO', 'Retention'],
    authorId: 'liam-park',
    publishedAt: '2026-01-12',
    readTime: '9 min read',
    featured: false,
    views: 2488,
    content: [
      'Page views are useful but incomplete. They capture attention, not value. Teams need deeper signals to guide editorial strategy.',
      'Track completion rate, return visits, and assisted signups. Together, these metrics reveal whether content is creating meaningful behavior change.',
      'Use a monthly scorecard that ranks articles by business contribution. This helps prioritize updates and retire weak legacy pages.',
      'When analysts and editors share one scorecard, decision speed improves and experiments become easier to compare.'
    ],
  },
  {
    slug: 'the-case-for-opinionated-design-tokens',
    title: 'The Case for Opinionated Design Tokens',
    excerpt: 'Why fewer tokens and stronger defaults create better interfaces.',
    category: 'Design',
    tags: ['Design System', 'CSS', 'Frontend'],
    authorId: 'sofia-lin',
    publishedAt: '2026-01-05',
    readTime: '5 min read',
    featured: false,
    views: 2214,
    content: [
      'Design systems fail when they expose too much freedom. Teams spend time debating options instead of shipping coherent interfaces.',
      'Start with opinionated defaults for spacing, typography, and color. Fewer choices force consistency and reduce review noise.',
      'Reserve escape hatches for rare cases with documented rationale. Uncontrolled overrides are a common source of visual debt.',
      'Strong token governance creates faster implementation and clearer product identity across pages and teams.'
    ],
  },
  {
    slug: 'writing-technical-posts-readers-finish',
    title: 'Writing Technical Posts Readers Finish',
    excerpt: 'Structure patterns that keep long-form technical writing readable.',
    category: 'Writing',
    tags: ['Docs', 'Writing', 'Clarity'],
    authorId: 'maya-chen',
    publishedAt: '2025-12-28',
    readTime: '10 min read',
    featured: false,
    views: 3141,
    content: [
      'Technical posts often lose readers because they front-load complexity without showing practical payoff.',
      'Open with the concrete problem and expected result. This helps readers decide quickly if the article is relevant to their work.',
      'Use short section loops: idea, example, takeaway. Repeat this rhythm and readers retain more of the core argument.',
      'End with implementation steps and known tradeoffs. Clarity builds trust and increases the chance of sharing.'
    ],
  },
  {
    slug: 'launch-checklist-for-small-product-updates',
    title: 'Launch Checklist for Small Product Updates',
    excerpt: 'A lean launch process for teams shipping every week.',
    category: 'Product',
    tags: ['Launch', 'QA', 'Operations'],
    authorId: 'liam-park',
    publishedAt: '2025-12-19',
    readTime: '6 min read',
    featured: false,
    views: 1876,
    content: [
      'Small updates still deserve a launch routine. Without one, teams miss edge cases and lose confidence in frequent releases.',
      'Use a checklist with owner names, rollback notes, and communication copy. Keep it short enough to run every week.',
      'Post-launch monitoring should focus on one primary metric and two guardrails. This limits confusion in the first hour.',
      'A disciplined checklist reduces fire drills and makes weekly shipping sustainable for lean teams.'
    ],
  },
  {
    slug: 'from-static-blog-to-content-engine',
    title: 'From Static Blog to Content Engine',
    excerpt: 'How to evolve a simple blog into a scalable content product.',
    category: 'Growth',
    tags: ['Roadmap', 'Platform', 'SEO'],
    authorId: 'maya-chen',
    publishedAt: '2025-12-10',
    readTime: '8 min read',
    featured: false,
    views: 2650,
    content: [
      'A static blog is a good start, but growth requires systems for discovery, refresh, and distribution.',
      'Define content tiers: flagship guides, recurring briefs, and tactical updates. Each tier supports different user needs.',
      'Build a refresh calendar for top-performing pages. Updating proven assets often beats publishing entirely new content.',
      'As structure matures, your blog becomes a content engine that compounds traffic, trust, and product adoption.'
    ],
  },
];

export const featuredPosts = posts.filter((post) => post.featured);

export const categories = [...new Set(posts.map((post) => post.category))];

export const popularTags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 8);

export const siteStats = {
  totalArticles: posts.length,
  totalReaders: '128k',
  weeklyIssues: 142,
};

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getAuthorById(authorId: string) {
  return authors.find((author) => author.id === authorId);
}

export function getRelatedPosts(slug: string, category: string) {
  return posts
    .filter((post) => post.slug !== slug && post.category === category)
    .slice(0, 3);
}
