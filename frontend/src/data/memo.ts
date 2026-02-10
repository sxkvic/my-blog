export interface MemoTask {
  id: string;
  title: string;
  details: string;
  date: string;
  priority: '高' | '中' | '低';
  status: 'todo' | 'done';
  category: '日常' | '技术' | '内容' | '游戏';
}
