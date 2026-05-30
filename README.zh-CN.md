# JasonQ 个人主页

这是 `JasonQ` 的静态个人主页。项目使用 Vite 提供本地热加载和生产打包，最终部署产物仍然是普通静态文件，方便部署到服务器、OSS 或 CDN。

开场动画现在按 `Product-minded AI Builder + Product Builder/Design Engineer/AI Architect -> JasonQ -> Q 放大且 Jason 缩到左上角 -> 背景横条从左向右插入 -> 页面打开` 执行。开场动画始终使用英文。主页默认英文，不再读取浏览器语言，导航里的 `EN / 中文` 控件可手动切换中英文。继续下滑后，每一屏展示一个项目。

## 运行

首次运行先安装依赖：

```sh
npm install
```

启动带热加载的本地开发服务：

```sh
npm run dev
```

然后访问 `http://127.0.0.1:5500`。

构建生产静态文件到 `dist/`：

```sh
npm run build
```

## 结构

- `index.html`：语义化页面结构和组件挂点。
- `package.json`：Vite 开发、构建和预览脚本。
- `styles.css`：样式入口，只负责按顺序导入 `styles/` 下的文件。
- `styles/tokens.css`：设计 token 和开场动画时间变量。
- `styles/sections/`：首页、项目页等页面级板块样式。
- `styles/components/`：站点头部、资料卡、项目 demo、开场动画等组件样式。
- `styles/responsive.css`：响应式和减少动效状态。
- `scripts/site-config.js`：开场配置、双语文案和项目注册表。
- `scripts/intro-controller.js`：开场状态重置、重新播放和结束状态控制。
- `scripts/site.js`：页面启动入口、语言切换和项目元信息同步。
- `scripts/main.js`：Vite 模块入口，按顺序加载站点脚本。
- `assets/avatar.jpg`：由原始 HEIC 图片转换得到的主页头像。
- `assets/logo-unsw.png` / `assets/logo-samsung.png`：资料卡时间线使用的学校和公司本地 logo 资产，均来自官方网站资源。
- `assets/home-bg-warm-studio.jpg`：本地首屏背景图。
- `assets/logo-*.svg`：本地 logo 资产，包含 MCP、LangGraph、PyTorch、AI SDK、Go 和常见 devicon 标识等官方或主流图标。RAG、Workflow、Skills、CI/CD 属于能力项而不是稳定独立品牌标识，页面里使用文字 badge。
- `docs/`：中文动画和架构文档。

## 说明

当前项目文案和链接仍是占位内容，后续替换为真实信息即可。首屏背景和技术栈远程图标已经下载到 `assets/`，部署后运行时不再依赖 Unsplash 或 devicon CDN。
