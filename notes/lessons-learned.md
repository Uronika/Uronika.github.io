# 踩坑记录

本文件记录开发与维护过程中的实际问题、根因与解决方式，便于后续复盘和避免重复踩坑。

---

## 2026-07-12 — v2 字体显示异常

### 现象
网站部署后字体渲染异常：CJK（中日韩）文字在 Windows / Linux 上可能出现 fallback 字体不佳、字间距拥挤，以及 reduced-motion 环境下页面空白。

### 根因分析

| 问题 | 具体原因 |
|---|---|
| **CSS/JS 类名不匹配** | CSS 用 `body.loading main` 隐藏页面，但 JS 只操作 `html.is-loading`，从未移除 `body.loading`。当用户开启 `prefers-reduced-motion` 时，Motion One 动画被跳过，样式表规则优先，页面永久不可见 |
| **CJK 字体回退链太弱** | `--font-sans` 只有 `"Noto Sans SC"` 作为唯一 CJK 字体。Windows 无此字体时落到 `system-ui → Segoe UI → sans-serif → SimHei`（不匹配瑞士现代主义风格）；monospace 完全没有 CJK 回退 |
| **中文字符上负 letter-spacing** | 标题和作品链接用了 `-0.02em` 到 `-0.03em` 的负间距。CJK 是等宽方框字符，负间距导致字面碰撞、阅读困难。该属性只适合拉丁字母 |
| **标签徽章内联样式重复** | RAG 详情页 5 个 span 各自复制了 120+ 字符的 `style="..."` 属性，写法冗余且无复用性 |
| **缺少 font-synthesis / font-optical-sizing** | `font-synthesis: none` 防止浏览器在未加载的 weight 上合成假粗体/假斜体；`font-optical-sizing: auto` 是可变字体最佳实践 |

### 修复清单

1. CSS 选择器 `body.loading main` → `html.is-loading main`（与 JS 对齐）
2. `--font-sans` 补齐 `"PingFang SC"`, `"Microsoft YaHei"`, `"Hiragino Sans GB"`
3. `--font-mono` 加 `"Noto Sans SC"` 作为 CJK mono 回退
4. 全局 `h1-h6` `letter-spacing` → `0`；`.text-display` / `.text-heading` → `-0.01em`；`.home-work-link` 移除
5. 提取 `.tag-badge` CSS 类，替换 5 处内联样式
6. `body` 加 `font-synthesis: none` + `font-optical-sizing: auto`

### 教训

- **CSS 类和 JS 操作必须做一致性交叉校验**，尤其是在涉及 `loading` / `is-loading` 这类初始化状态时。一个拼写差异就能导致某些用户永远看不到页面。
- **负 letter-spacing 不应放在全局规则上**。如果要用于拉丁标题，只对 `:lang(en)` 或特定 class 单独设置，不要在 CJK 内容为主的站点上做全局负间距。
- **CJK 字体回退链不能只有 Google Fonts 中的一个 web font**。web font 可能加载失败或被墙；必须有系统内置字体做最终兜底。
- **压缩内联样式为 CSS class** 不是仅为了美观——重复内联样式增加页面体积，且修改一处需要改 N 处。

---

## 2026-07-12 — UTF-8 编码损毁（3 字节序列第三字节被 0x3F 替换）

### 现象
用户反馈字体问题未解决，截图显示页面中文全部乱码（Mojibake）。经排查发现所有 10 个 HTML 文件存在 UTF-8 编码损毁：大量 3 字节 UTF-8 序列的第三字节被 `0x3F`（ASCII `?`）替换。

### 根因分析
- 损毁模式一致：仅影响 3 字节 UTF-8 序列（CJK 字符 + 全角标点），第三字节全部变为 `0x3F`。1 字节（ASCII）和较短的 2 字节序列不受影响。
- 怀疑初始 v2 创建时（`854a7b9`），`write_file` 工具在 Windows 环境下写入中文内容时，部分字符的第三字节丢失，被替换为 `?`。初始提交有 114 处损毁。
- 第一轮 CSS 编辑中替换掉了一部分损毁片段（114 → 17），但未被触碰的中文正文仍存在大量损毁。

### 修复清单
1. 编写 Python 字节级修脚本，枚举全部 30 种损毁模式（双字节前缀 + `3F` → 正确第三字节）
2. 两轮运行修复全部 10 个文件；160+ 处损毁全部清零
3. 经 Python `decode('utf-8')` 全量校验通过

### 教训
- **新建含非 ASCII 字符的文件后，务必校验 UTF-8 有效性**。一条简单的 `python3 -c "open('f.html','rb').read().decode('utf-8')"` 即可发现编码问题。
- **不要轻信工具输出**。`read_file` 工具显示的中文乱码不是终端渲染问题，而是真实的文件损毁。看到乱码应立即用字节级检查确认。
- **Git 不会自动检测编码错误**。文件在仓库中静默损坏，只有人工检查才能发现。

---

## 模板

后续踩坑请按以下格式追加：

```markdown
## YYYY-MM-DD — 简短标题

### 现象
（用户看到什么不对）

### 根因分析
（为什么发生，技术层面的解释）

### 修复清单
（具体改了什么）

### 教训
（以后怎么避免）
```
