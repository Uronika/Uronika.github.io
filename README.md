# Uronika Personal Blog v3

Industrial Archive redesign — zero-build pure static site.

- **v3 (redesign-v2 branch)** — current live version · 工业档案风格
- **v2** — Swiss modernist (see tag `backup/20260712-000000-before-redesign-v2`)
- **v1 (main branch)** — original Astro build, preserved as archive

## 技术栈

纯 HTML/CSS，零构建、零 JS、零动画。Google Fonts 加载 Zilla Slab + Inter + Noto Sans SC。

## 项目结构

```text
/
├── index.html           首页 — A4 档案卡（身份 + 作品索引 + 简历摘要 + 联系）
├── resume.html          简历 — A4 职业记录卡
├── contact.html         联系 — A4 联系记录卡
├── works/
│   ├── index.html       作品档案索引
│   └── *.html           作品详情 · A4 卡片（6 个条目）
├── css/style.css        设计系统
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

## License

本项目主要用于个人网站展示。未经许可，请勿直接复制其中的个人资料和图片。

## Release 索引

正式版本、完整改动说明与可恢复版本见 [GitHub Releases](https://github.com/Uronika/Uronika.github.io/releases)。

## 设计概要

### v3 — 工业档案（当前）
详见 [notes/design-v3-industrial-brutalist.md](notes/design-v3-industrial-brutalist.md)。

- **动画哲学**：零动画，硬切换。移除 Motion One 依赖。
- **视觉风格**：工业粗野主义 + A4 档案版式，报纸级高密度。
- **配色**：灰白底 `#EBE7E0` + 纸白 `#FAFAF8` + 纯黑 `#111111`，酸性黄 `#E6FF00` 细节。
- **字体**：Zilla Slab（标题） + Inter（正文） + Noto Sans SC。
- **首页**：A4 档案卡，含身份、作品索引、简历摘要、联系索引。
- **线条**：大量 2-4px 粗黑线作页框与分割。

### v2 — 瑞士现代主义（已存档）

- 动画哲学：极简克制，仅 crossfade 淡入淡出 + 纯 CSS hover
- 视觉风格：瑞士现代主义 + 暖调纸张质感（#F7F3ED），取消全部圆角/阴影/模糊
- 字体：几何无衬线 Jost + Noto Sans SC
- 首页：单屏不对称 6 列网格
- 动效库：Motion One ~3KB（SRI 校验）
