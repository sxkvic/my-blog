export interface ToolLinkItem {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  iconText: string;
  ownerUserId?: number;
}

export const seedToolLinks: ToolLinkItem[] = [
  {
    id: 'tool-mdn',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org/',
    description: '前端和 Web API 查询首选文档站。',
    category: '开发文档',
    iconText: 'M',
  },
  {
    id: 'tool-github',
    name: 'GitHub',
    url: 'https://github.com/',
    description: '代码托管与开源项目协作平台。',
    category: '开发平台',
    iconText: 'GH',
  },
  {
    id: 'tool-can-i-use',
    name: 'Can I Use',
    url: 'https://caniuse.com/',
    description: '快速查询浏览器兼容性支持情况。',
    category: '实用工具',
    iconText: 'CI',
  },
  {
    id: 'tool-v2ex',
    name: 'V2EX',
    url: 'https://www.v2ex.com/',
    description: '开发者社区与技术讨论论坛。',
    category: '常用论坛',
    iconText: 'V',
  },
  {
    id: 'tool-figma',
    name: 'Figma',
    url: 'https://www.figma.com/',
    description: '界面设计与原型协作工具。',
    category: '创意设计',
    iconText: 'F',
  },
];
