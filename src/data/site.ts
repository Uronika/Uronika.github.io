export type SocialLink = {
  label: string;
  href?: string;
  handle: string;
  placeholder?: boolean;
};

export type SkillGroup = {
  title: string;
  description: string;
  skills: string[];
  evidenceHref?: string;
};

export const siteProfile = {
  alias: "Uronika",
  realName: "真实姓名待补充",
  role: "目标职位待补充",
  availability: "求职状态待补充",
  location: "所在地待补充",
  email: "",
  emailLabel: "邮箱待补充",
  introduction:
    "这里将用一段简洁、具体的第一人称介绍，说明我的专业方向、擅长解决的问题，以及开发与创作经历如何彼此连接。",
  githubUsername: "Uronika",
  siteUrl: "https://uronika.github.io",
  socials: [
    { label: "GitHub", href: "https://github.com/Uronika", handle: "@Uronika" },
    { label: "视频账号", handle: "账号待补充", placeholder: true },
    { label: "图片创作账号", handle: "账号待补充", placeholder: true }
  ] satisfies SocialLink[]
};

export const skillGroups: SkillGroup[] = [
  {
    title: "软件开发",
    description: "技术栈、工程实践与目标岗位相关能力将在补充真实资料后呈现。",
    skills: ["技能待补充", "工具待补充", "工程证据待补充"],
    evidenceHref: "/works/?category=development"
  },
  {
    title: "游戏创作",
    description: "用于展示引擎经验、玩法实现、系统设计或独立开发职责。",
    skills: ["引擎待补充", "职责待补充", "实机作品待补充"],
    evidenceHref: "/works/?category=game"
  },
  {
    title: "影像与视觉",
    description: "用于连接视频、图片创作与产品表达能力。",
    skills: ["视频能力待补充", "图像能力待补充", "创作工具待补充"],
    evidenceHref: "/works/?category=video"
  }
];

export const resume = {
  summary:
    "职业摘要待补充：请使用可验证的事实说明目标职位、经验重点、擅长领域和希望解决的问题。",
  experience: [
    {
      period: "时间待补充",
      organization: "公司或组织待补充",
      role: "职位待补充",
      description: "职责、行动与可量化成果待补充。",
      placeholder: true
    }
  ],
  education: [
    {
      period: "时间待补充",
      organization: "院校待补充",
      role: "专业或学位待补充",
      description: "与目标职位相关的学习、课程或实践待补充。",
      placeholder: true
    }
  ],
  honors: ["荣誉或证书待补充"],
  projects: ["代表项目待补充"]
};

export const accounts = [
  {
    platform: "GitHub",
    handle: "@Uronika",
    description: "公开仓库、代码实验与开发作品。精选仓库将由人工策展并补充定制封面。",
    featuredContent: "精选仓库待补充",
    href: "https://github.com/Uronika",
    placeholder: false
  },
  {
    platform: "视频平台",
    handle: "账号待补充",
    description: "视频内容方向、更新主题与代表视频将在资料确认后补充。",
    featuredContent: "代表内容待补充",
    placeholder: true
  },
  {
    platform: "图片创作平台",
    handle: "账号待补充",
    description: "图片创作方向、系列介绍与代表作品将在资料确认后补充。",
    featuredContent: "代表内容待补充",
    placeholder: true
  }
];

