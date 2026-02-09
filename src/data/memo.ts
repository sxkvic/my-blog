export interface MemoTask {
  id: string;
  title: string;
  details: string;
  date: string;
  priority: '高' | '中' | '低';
  status: 'todo' | 'done';
  category: '日常' | '技术' | '内容' | '游戏';
}

export const memoSeedTasks: MemoTask[] = [
  {
    id: 'm1',
    title: '发布 Vue3 主题切换复盘',
    details: '补两张实现流程图和一段 30 秒演示视频。',
    date: '2026-02-09',
    priority: '高',
    status: 'todo',
    category: '技术',
  },
  {
    id: 'm2',
    title: '整理游戏仓账号安全策略',
    details: '记录 2FA、密码轮换周期、敏感字段掩码规则。',
    date: '2026-02-10',
    priority: '中',
    status: 'todo',
    category: '游戏',
  },
  {
    id: 'm3',
    title: '写一篇周记：本周输出节奏',
    details: '聚焦三件事：写作、编码、锻炼。',
    date: '2026-02-09',
    priority: '中',
    status: 'done',
    category: '日常',
  },
  {
    id: 'm4',
    title: '拍摄博客首页动效短视频',
    details: '用于首页文章插图和社媒同步。',
    date: '2026-02-12',
    priority: '低',
    status: 'todo',
    category: '内容',
  },
];
