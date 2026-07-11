# Uronika Personal Blog v2

Swiss modernist redesign — zero-build pure static site.

- **v2 (redesign-v2 branch)** — current live version
- **v1 (main branch)** — original Astro build, preserved as archive

## 技术栈

纯 HTML/CSS/JS，零构建步骤。Motion One (~3KB) 驱动跨页淡入淡出过渡，Google Fonts 加载 Jost + Noto Sans SC。

## 项目结构

```text
/
├── index.html           首页 — 不对称网格摘要式
├── resume.html          简历 — 时间线排版
├── contact.html         联系 — 联系方式与社交平台
├── works/
│   ├── index.html       作品列表
│   └── *.html           作品详情（6 个条目）
├── css/style.css        设计系统
├── js/main.js           Crossfade 导航
├── favicon.svg
└── robots.txt
```

## 本地预览

任意静态服务器即可，无需安装依赖：

```bash
npx serve .
# 或
python3 -m http.server 8080
```

## 部署

推送到 `redesign-v2` 分支，在 **Settings → Pages** 中将 Branch 设为 `redesign-v2`。

## 备份、推送与 Release 规则

- 开始修改任何受 Git 跟踪的文件前，先确认工作树状态和变更边界；不得覆盖已有的未提交改动。
- 工作树干净且本地基线与远端一致后，为改动前的基线提交创建并推送带说明的备份标签，命名格式为 `backup/YYYYMMDD-HHmmss-before-<task>`。该标签是本次任务的恢复点，不替代常规提交。
- 修改完成后运行与变更风险相称的最小必要验证；验证通过后提交并推送。
- 正式版本使用语义化版本：修复、文档和小调整递增补丁版本，向后兼容的新内容或功能递增次版本，不兼容变更递增主版本。
- 所有受 Git 跟踪文件的新增、修改、移动和删除都必须写入对应 Release 说明；`.gitignore` 生成物不纳入记录。
- Release 说明必须包含 Asia/Hong_Kong 日期时间、改动前备份标签、目标提交、涉及文件或目录、改动梗概、验证方式与结果，以及仍然存在的风险或待办事项。
- Release 历史不得覆盖或删除。README 只保留本流程和 Release 索引，详细改动记录以 GitHub Releases 为准。

## 后续计划

- 填写真实姓名、目标职位、简历、邮箱与公开账号
- 为每个作品准备定制的截图与内容
- 确定强调色（可通过 visual reference 出图后决定）

## License

本项目主要用于个人网站展示。未经许可，请勿直接复制其中的个人资料和图片。

## Release 索引

正式版本、完整改动说明与可恢复版本见 [GitHub Releases](https://github.com/Uronika/Uronika.github.io/releases)。

## 本次对话概要（2026-07-11 ~ 2026-07-12）

详细记录见 [notes/2026-07-12-redesign-v2-conversation.md](notes/2026-07-12-redesign-v2-conversation.md)。

### 背景
用户认为旧版网站"AI 感太重"（深色熔岩橙玻璃拟态、视差拼贴、snap scroll 等均为 AI 生成高频模式），决定推倒重做。

### 设计决策
通过多轮追问逐一敲定，不假设用户选择：
- **动画哲学**：极简克制，仅 crossfade 淡入淡出 + 纯 CSS hover
- **视觉风格**：瑞士现代主义 + 暖调纸张质感（#F7F3ED），取消全部圆角/阴影/模糊
- **字体**：几何无衬线 Jost + Noto Sans SC
- **首页**：单屏不对称 6 列网格（左侧身份，右侧作品入口+联系）
- **子页**：作品列表 + 6 个详情 + 简历 + 联系
- **技术栈**：从 Astro+TypeScript+pnpm 迁移至零构建纯静态 HTML/CSS/JS
- **动效库**：Motion One ~3KB（SRI 校验），GSAP 被选中但实际选用更轻量的 Motion One

### 执行摘要
1. 创建 `backup/20260712-000000-before-redesign-v2` 标签保护旧版基线
2. 在 `redesign-v2` 分支清空旧版，建立纯静态目录
3. 编写 14KB 瑞士现代主义 CSS 设计系统（tokens/typography/grid/4 breakpoints）
4. 实现 Motion One crossfade 导航（离开 0.25s → 进入 0.35s）
5. 构建 10 个 HTML 页面（首页 + 9 子页），RAG 技术拆解完整保留
6. 安全审计通过（零 XSS 向量、零密钥暴露、CDN SRI 校验）
7. 内部链接一致性交叉校验通过

### 待办
- 强调色待 imagegen 出参考图后确定（占位 #C75146）
- 个人信息仍为占位
- 5 个作品条目仍为占位
- GitHub Pages 需手动切换部署分支至 `redesign-v2`（从旧版 GitHub Actions 切到 Deploy from branch）
- v2.0.0 Release 待手动创建（token 缺少 pages:write 权限）
