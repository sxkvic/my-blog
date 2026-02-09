export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export type Channel = '日记' | '技术心得' | '游戏心得';

export interface PostMedia {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  channel: Channel;
  category: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  views: number;
  media?: PostMedia[];
  createdByUser?: boolean;
}

export interface GameVaultItem {
  id: string;
  game: string;
  server: string;
  account: string;
  password: string;
  role: string;
  lastLogin: string;
  notes: string;
}

export const siteData = {
  name: 'Neo日志',
  tagline: '写生活、写代码、写游戏，做一个有记忆的数字基地。',
  newsletterText: '每周日发送一封总结邮件：本周复盘 + 技术碎片 + 游戏记录。',
};

export const authors: Author[] = [
  { id: 'kai', name: 'K', role: '站长 / 前端工程师', avatar: 'K' },
  { id: 'lin', name: '林木', role: '技术编辑', avatar: 'LM' },
  { id: 'yuan', name: '远山', role: '生活观察员', avatar: 'YS' },
];

export const posts: BlogPost[] = [
  {
    slug: 'rainy-night-debug-log',
    title: '雨夜排错记：我和一个幽灵 bug 的 3 小时',
    excerpt: '一次看似随机的线上报错，最后竟然是时区与缓存双重叠加。',
    channel: '日记',
    category: '生活开发',
    tags: ['排错', '复盘', '真实记录'],
    authorId: 'kai',
    publishedAt: '2026-02-04',
    readTime: '7 分钟',
    featured: true,
    views: 1830,
    content: [
      '晚上 10 点收到告警的时候，我本来只想看一眼就睡，结果越看越不对劲。错误日志每 20 分钟出现一次，像被谁设置了定时器。',
      '第一轮排查把请求链路和接口都看了一遍，没有明显异常。直到我对比 UTC 时间戳和业务时间，才发现缓存键里混入了本地时区。',
      '修复后我补了一条单测，并把缓存策略写进团队文档。这个 bug 提醒我：很多线上事故不是难在代码，而是难在边界条件。',
    ],
  },
  {
    slug: 'vite-vue-split-strategy',
    title: 'Vite + Vue 项目拆分策略：从单体到可维护架构',
    excerpt: '分享我在个人博客里实践的目录与模块拆分方案。',
    channel: '技术心得',
    category: '前端工程化',
    tags: ['Vite', 'Vue3', '架构'],
    authorId: 'lin',
    publishedAt: '2026-02-02',
    readTime: '10 分钟',
    featured: true,
    views: 2614,
    content: [
      '小项目很容易越写越乱，原因通常不是功能多，而是边界不清。页面、组件、数据、路由混在一起，后期改一处动全身。',
      '我的做法是先划分稳定层：数据模型、页面容器、可复用组件。页面容器只做编排，不写复杂业务。',
      '当目录变得清晰，迭代速度会明显提升。你会发现“加一个栏目”不再是重构级别的工作。',
    ],
  },
  {
    slug: 'my-weekend-walk-map',
    title: '周末散步地图：我在城市里找回注意力的方式',
    excerpt: '不带耳机散步 90 分钟，我记录了 5 个意外收获。',
    channel: '日记',
    category: '个人生活',
    tags: ['散步', '专注力', '慢生活'],
    authorId: 'yuan',
    publishedAt: '2026-01-29',
    readTime: '5 分钟',
    featured: false,
    views: 1120,
    content: [
      '这一周我被消息和会议切得很碎，周末决定只做一件事：沿着河道走 90 分钟。',
      '不听播客，不刷手机，反而更容易把脑子里的噪音清掉。很多卡住的想法，会在走路时自动拼起来。',
      '后来我把这段路线做成了“恢复路线”，当我觉得焦躁时就去走一次。',
    ],
  },
  {
    slug: 'component-animation-practice',
    title: '让组件“会呼吸”：我常用的 4 种动效节奏',
    excerpt: '不是越多动画越高级，关键是让信息层级被感知。',
    channel: '技术心得',
    category: '交互动效',
    tags: ['CSS', '动效', 'UI'],
    authorId: 'lin',
    publishedAt: '2026-01-27',
    readTime: '8 分钟',
    featured: false,
    views: 1986,
    content: [
      '页面加载动画的作用不是炫技，而是告诉用户“先看哪里”。',
      '我习惯把动效分成进入、悬停、状态切换三层，每层只做一个动作，避免互相抢戏。',
      '当你把动画看成信息引导工具，界面会更像产品，而不是模板。',
    ],
  },
  {
    slug: 'elden-ring-build-notes',
    title: '艾尔登法环二周目：敏信混合流配装心得',
    excerpt: '记录本周的武器组合、符文路线和 Boss 失误点。',
    channel: '游戏心得',
    category: '动作 RPG',
    tags: ['法环', 'Build', 'Boss'],
    authorId: 'kai',
    publishedAt: '2026-01-24',
    readTime: '6 分钟',
    featured: false,
    views: 3220,
    content: [
      '这套配装核心是“快切 + 中距离压制”，优点是容错高，缺点是蓝耗明显。',
      '打女武神时我最大的问题不是输出，而是贪刀。把节奏拆成两段后，胜率立刻提升。',
      '游戏心得和技术总结很像：先识别变量，再做最小闭环验证。',
    ],
  },
  {
    slug: 'obsidian-daily-template',
    title: '我的 Obsidian 日记模板：一页搞定记录与复盘',
    excerpt: '分享我每天都在用的结构，包含心情、任务、灵感和总结。',
    channel: '日记',
    category: '工具流',
    tags: ['Obsidian', '模板', '效率'],
    authorId: 'yuan',
    publishedAt: '2026-01-20',
    readTime: '4 分钟',
    featured: false,
    views: 890,
    content: [
      '我把日记分成四格：今天发生了什么、今天完成了什么、今天想到什么、明天只做哪一件事。',
      '核心目标不是写很多，而是保证明天回看时有价值。',
      '长期写下来，你会发现“情绪”和“执行力”是可以被观测的。',
    ],
  },
  {
    slug: 'api-cache-checklist',
    title: '接口缓存上线前检查清单（可直接复用）',
    excerpt: '一份我在项目中反复复用的缓存检查清单。',
    channel: '技术心得',
    category: '后端协作',
    tags: ['API', '缓存', 'Checklist'],
    authorId: 'lin',
    publishedAt: '2026-01-17',
    readTime: '9 分钟',
    featured: false,
    views: 1540,
    content: [
      '缓存策略最怕“看起来没问题”。很多问题只在高并发和异常链路里出现。',
      '上线前我会固定检查 7 项，包括键设计、过期策略、主动失效与监控指标。',
      '这份清单救过我很多次，特别是在需求变化非常快的阶段。',
    ],
  },
  {
    slug: 'steam-weekly-log',
    title: 'Steam 本周游玩日志：3 个游戏，2 个惊喜，1 个踩坑',
    excerpt: '把娱乐时间也做成可回顾的记录，避免“玩了但没留下什么”。',
    channel: '游戏心得',
    category: '周记',
    tags: ['Steam', '周报', '推荐'],
    authorId: 'kai',
    publishedAt: '2026-01-15',
    readTime: '5 分钟',
    featured: false,
    views: 2090,
    content: [
      '这周玩的三款里，一款机制很惊艳但后期重复度高，一款叙事短小但后劲十足。',
      '我开始给每款游戏打“情绪分”和“重复游玩分”，比单纯评分更有参考价值。',
      '把游戏体验写下来，会让你更清楚自己真正喜欢什么。',
    ],
  },
];

export const gameAccounts: GameVaultItem[] = [
  {
    id: 'g1',
    game: 'Steam',
    server: '全球',
    account: 'neon_player_77',
    password: 'St3am!2026#Vault',
    role: '主账号',
    lastLogin: '2026-02-08',
    notes: '开启手机令牌，常用设备 2 台。'
  },
  {
    id: 'g2',
    game: '原神',
    server: '天空岛',
    account: 'k_blog_genshin',
    password: 'Yu@nShen_2FA_01',
    role: '日常号',
    lastLogin: '2026-02-07',
    notes: '深境每月刷新前做阵容记录。'
  },
  {
    id: 'g3',
    game: '崩坏：星穹铁道',
    server: '国服',
    account: 'trail_record_2048',
    password: 'RailPass#2088',
    role: '剧情号',
    lastLogin: '2026-02-06',
    notes: '主线推进前拍阵容快照，便于回顾。'
  },
  {
    id: 'g4',
    game: '英雄联盟',
    server: '艾欧尼亚',
    account: 'midlane_journal',
    password: 'LOL_rank!889',
    role: '排位号',
    lastLogin: '2026-02-05',
    notes: '只在周三和周六打排位，避免情绪上头。'
  },
];

export const featuredPosts = posts.filter((post) => post.featured);
export const categories = [...new Set(posts.map((post) => post.category))];
export const channels: Channel[] = ['日记', '技术心得', '游戏心得'];
export const popularTags = [...new Set(posts.flatMap((post) => post.tags))].slice(0, 10);

export const siteStats = {
  totalArticles: posts.length,
  totalReaders: '9.8k',
  weeklyIssues: 58,
};

export const diaryPosts = posts.filter((post) => post.channel === '日记');
export const techPosts = posts.filter((post) => post.channel === '技术心得');
export const gamePosts = posts.filter((post) => post.channel === '游戏心得');

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function getAuthorById(authorId: string) {
  return authors.find((author) => author.id === authorId);
}

export function getRelatedPosts(slug: string, channel: Channel) {
  return posts.filter((post) => post.slug !== slug && post.channel === channel).slice(0, 3);
}
