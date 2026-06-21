# Uronika Personal Blog

这是一个面向招聘者与技术同行的个人作品和职业档案网站，计划托管在 [GitHub Pages](https://pages.github.com/) 上。

网站使用 Astro 生成纯静态页面，集中展示个人简历、公开账号、精选仓库、游戏项目、视频与图片创作。作品内容按核验进度逐项上线；未核实条目继续明确标记为“待补充”，不代表真实经历。

## 已实现内容

- 深色熔岩橙与珊瑚红暖光视觉、玻璃面板和响应式布局
- 五段吸附式桌面首页、统一作品库、作品详情、网页简历、联系页与自定义 404
- 放大并置于标题下层的桌面作品拼贴，以及右侧章节圆点导航
- 开发、游戏、视频和图像四类作品筛选
- 键盘可操作的图片灯箱和移动端全屏导航
- Markdown 作品内容与类型化个人资料
- 构建时 GitHub 元数据读取及本地回退快照
- 网页简历同源生成 PDF
- Open Graph、站点地图、robots 和结构化数据
- Playwright 桌面端、移动端与无障碍 E2E 测试
- GitHub Actions 自动构建、验证并部署 Pages

## 技术栈

- Astro + TypeScript（严格模式）
- 原生 CSS 设计令牌与组件样式
- pnpm 10
- Playwright + axe-core
- GitHub Actions / GitHub Pages

## 项目结构

```text
src/
├─ pages/              页面路由
├─ components/         导航、卡片、筛选、灯箱等组件
├─ layouts/            全站布局与 SEO
├─ content/works/      Markdown 作品和案例研究
├─ data/               个人、简历、账号和 GitHub 数据
├─ lib/                GitHub 与作品工具
└─ styles/             全局设计系统
public/                图标、占位图和社交分享资源
scripts/               GitHub 同步、OG 和 PDF 生成脚本
tests/e2e/             Playwright 端到端测试
.github/workflows/     GitHub Pages 部署流程
```

## 本地开发

需要 Node.js 22.12 或更高版本，以及 pnpm 10 或更高版本。

```bash
pnpm install
pnpm dev
```

打开终端显示的本地网址即可预览。

## 验证与构建

```bash
# Astro 类型和内容检查
pnpm check

# 同步仓库数据、生成 OG 图片、构建静态页面和简历 PDF
pnpm build

# 生产构建完成后运行桌面与移动端 E2E
pnpm test:e2e
```

Playwright 优先复用 `C:\Users\Mavis\AppData\Local\ms-playwright` 中的 Chromium；只有缓存缺少兼容版本时才需要运行 `pnpm exec playwright install chromium`。

项目没有写入持久运行日志。构建和同步状态仅输出到本地终端或 GitHub Actions 运行记录中。

## 填写真实资料

- 在 `src/data/site.ts` 中填写姓名、目标职位、简介、邮箱、简历与账号。
- 在 `src/content/works/` 中用真实作品替换六个占位条目。
- 在 `public/images/` 中加入逐项定制的作品封面和图库素材。
- 在 `src/data/repositories.json` 中列出需要获取 GitHub 元数据的精选仓库名称。
- 确认数据后更新 `src/data/github-fallback.json`，保证 GitHub API 不可用时仍能构建。

仓库介绍必须人工核对，准确说明项目定位、本人职责、核心技术、难点与成果，不直接把 README 自动摘要当作最终文案。

## 发布到 GitHub Pages

1. 在 GitHub 创建名为 `Uronika.github.io` 的用户主页仓库。
2. 将本地 `main` 分支关联并推送到该仓库。
3. 在仓库 **Settings → Pages** 中将 Source 设置为 **GitHub Actions**。
4. `.github/workflows/deploy-pages.yml` 会自动检查、构建、测试并发布 `dist/`。
5. 部署成功后通过 `https://uronika.github.io` 访问网站。

当前仓库已关联并推送至 `Uronika/Uronika.github.io`，由 GitHub Actions 自动验证并部署到 `https://uronika.github.io`。

## 备份、推送与 Release 规则

- 开始修改任何受 Git 跟踪的文件前，先确认工作树状态和变更边界；不得覆盖已有的未提交改动。
- 工作树干净且本地基线与远端一致后，为改动前的基线提交创建并推送带说明的备份标签，命名格式为 `backup/YYYYMMDD-HHmmss-before-<task>`。该标签是本次任务的恢复点，不替代常规提交。
- 修改完成后运行与变更风险相称的最小必要验证；验证通过后提交并推送 `main`。
- 推送后等待 GitHub Actions 检查和 Pages 部署成功，再立即为该提交创建 GitHub Release。检查或部署失败时不得发布 Release，应先修复并重新验证。
- 正式版本使用语义化版本：修复、文档和小调整递增补丁版本，向后兼容的新内容或功能递增次版本，不兼容变更递增主版本。
- 所有受 Git 跟踪文件的新增、修改、移动和删除都必须写入对应 Release 说明，包括 `README.md` 自身；`node_modules/`、`dist/`、`.astro/`、`.cache/`、测试报告和其他 `.gitignore` 生成物不纳入记录。
- Release 说明必须包含 Asia/Hong_Kong 日期时间、改动前备份标签、目标提交、涉及文件或目录、改动梗概、验证方式与结果，以及仍然存在的风险或待办事项。
- Release 历史不得覆盖或删除。README 只保留本流程、Release 索引和制度启用前的历史记录，今后的详细改动记录以 GitHub Releases 为准。

## 后续计划

- 填写真实姓名、目标职位、简历、邮箱与公开账号
- 筛选真实公开仓库并逐项撰写准确介绍
- 为每个真实作品准备定制封面、截图与视频链接
- 内容替换后重新运行桌面端、移动端和 PDF 视觉验证
- 按“改动前备份、验证后发布 Release”的流程持续维护线上版本

## License

本项目主要用于个人网站展示。未经许可，请勿直接复制其中的个人资料和图片。

## 发布记录

正式版本、完整改动说明与可恢复版本见 [GitHub Releases](https://github.com/Uronika/Uronika.github.io/releases)。

## 历史改动记录（Release 制度启用前）

以下记录为启用“改动前备份、验证后发布 Release”制度前的只读档案；后续记录不再追加到此表。

| 日期时间（Asia/Hong_Kong） | 涉及文件 | 改动梗概 |
| --- | --- | --- |
| 2026-06-20 14:55:45 | `README.md` | 新增项目改动记录规则，规定任何文件改动（包括 README 自身）都必须在文档末尾记录日期时间、涉及文件和改动梗概。 |
| 2026-06-20 16:25:18 | `.gitignore`、`.env.example`、`package.json`、`pnpm-lock.yaml`、`astro.config.mjs`、`tsconfig.json`、`playwright.config.ts`、`README.md` | 初始化本地 Git main 分支和 Astro + TypeScript + pnpm 工程骨架，配置生成物忽略规则与验证入口。 |
| 2026-06-20 16:25:18 | `src/`、`public/`、`scripts/`、`tests/e2e/`、`.github/workflows/`、`README.md` | 完成深色暖光个人网站首版、六个明确占位作品、GitHub 回退同步、OG/PDF 生成、SEO、Pages 部署和桌面/移动 E2E。 |
| 2026-06-20 16:30:40 | `README.md` | 记录首次 GitHub 发布准备，目标为公开用户主页仓库 `Uronika/Uronika.github.io` 的 `main` 分支。 |
| 2026-06-20 16:35:40 | `scripts/generate-resume-pdf.mjs`、`README.md` | 修复 Linux CI 下 Astro CLI 的跨平台定位，并使用随机预览端口避免残留进程掩盖 PDF 构建失败。 |
| 2026-06-20 18:42:11 | `astro.config.mjs`、`src/layouts/`、`src/components/`、`src/pages/`、`src/styles/global.css`、`tests/e2e/site.spec.ts`、`README.md` | 放大桌面首页作品拼贴，加入五段柔和吸附和章节圆点；将账号入口迁移至新的联系页，旧地址改为 noindex 兼容跳转并移出 sitemap。 |
