# 项目架构说明

## 目标

这个站点仍然是静态展示页，不引入前端框架。项目使用 Vite 作为开发和打包工具：开发时提供热加载，生产构建输出普通静态文件到 `dist/`，部署时只需要托管构建产物。当前架构的目标是把职责拆清楚：HTML 放内容和组件挂点，CSS 按层级管理视觉，JS 只处理页面状态、语言切换和开场动画启动。

## 目录职责

| 路径 | 职责 |
| --- | --- |
| `index.html` | 页面语义结构、首页内容、项目内容、loader 结构。 |
| `package.json` | Vite 本地开发、生产构建和构建预览脚本。 |
| `styles.css` | CSS 入口文件，只维护导入顺序。 |
| `styles/tokens.css` | 颜色、缓动、间距、背景图、开场动画时间变量。 |
| `styles/sections/` | 页面级板块样式，例如首页和项目分屏。 |
| `styles/components/` | 可复用组件样式，例如头部、资料卡、项目 demo、开场 loader。 |
| `styles/responsive.css` | 响应式规则和减少动效状态。 |
| `scripts/site-config.js` | 项目清单、双语文案、开场动画配置。 |
| `scripts/intro-controller.js` | 重置并添加开场状态类、处理重新播放和结束状态。 |
| `scripts/site.js` | 页面启动入口，处理默认英文、导航语言切换，并同步项目 section 的数据属性。 |
| `scripts/main.js` | Vite 模块入口，按顺序加载站点脚本，确保生产构建可以打包 JS。 |
| `assets/home-bg-warm-studio.jpg` | 本地首屏背景图，避免运行时依赖远程图片。 |
| `assets/logo-unsw.png` / `assets/logo-samsung.png` | 首页资料卡时间线使用的学校和公司 logo，均来自官方网站资源。 |
| `assets/logo-*.svg` | 首页技术栈使用的本地 logo 资产，例如 MCP、LangGraph、PyTorch、AI SDK、Go、Workflow、Skills、Vercel 和常见 devicon 标识。RAG、CI/CD 属于能力项而不是稳定独立品牌标识，页面使用文字 badge。 |
| `docs/` | 中文说明文档。README 另外保留中英文两份。 |

## 页面板块规范

每个页面级板块使用 `data-section` 标记职责：

- 首页：`data-section="home"`。
- 项目：`data-section="project"`。

每个组件使用 `data-component` 标记职责：

- 站点头部：`data-component="site-header"`。
- 首页资料卡：`data-component="profile-card"`。

首页资料卡里的时间线使用 `.timeline-item`，每个条目包含 logo、类型、机构/公司名、时间、学位或职位，以及一句职责/学习方向。中英文文案统一维护在 `scripts/site-config.js`。

## 项目规范

每个项目 section 需要具备：

- `class="project-section"`：项目分屏基础布局。
- `project-section--*`：项目主题变体。
- `data-section="project"`：声明这是项目板块。
- `data-project="项目 id"`：对应 `scripts/site-config.js` 里的项目注册表。
- `article.project-copy`：项目编号、标题、简介、链接。
- `div.project-demo`：项目视觉 demo。

新增项目时，先复制现有 `project-section` 结构，再在 `scripts/site-config.js` 的 `projects` 数组中登记 `id`、`order`、`title`。

## 多语言规范

主页默认 HTML 使用英文内容，页面初始化时始终应用英文文案，不读取浏览器语言，也不读取本地存储。用户可以通过导航中的 `EN / 中文` 控件临时切换中英文，刷新后恢复英文默认状态。

所有需要切换的文本使用 `data-i18n`，属性使用 `data-i18n-attr`。实际中英文文案统一维护在 `scripts/site-config.js` 的 `i18n.translations` 中。开场动画文案不进入双语字典，始终保持英文。

## 开场动画规范

开场动画的 HTML 只放必要层级：

- `.loader-black`：保留的过渡层占位，当前关闭，页面直接进入黄色开场。
- `.loader-field`：黄色底色。
- `.loader-window`：背景横条和背景展开层，内部图片与首页 `.home-bg` 使用同一个本地背景资源。
- `.loader-meta`：`Product Builder`、`Design Engineer`、`AI Architect` 三处辅助文字。
- `.loader-title`：第一阶段 `Product-minded AI Builder` 主标题。
- `.loader-logo--compact`：第二阶段 `JasonQ` 标识，后续由 `Jason` 和 `Q` 独立变形。
- `.loader-panel--top` / `.loader-panel--bottom`：上下划开的黄色块。

动画时间不分散写死在多个文件里，统一放在 `styles/tokens.css`，再由 loader、白卡、背景、导航共同引用。
