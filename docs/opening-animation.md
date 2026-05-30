# 个人主页开场动画说明

## 当前动画流程

开场动画由 `styles/components/opening-loader.css` 负责视觉时间线，由 `scripts/intro-controller.js` 负责启动和结束状态。动画开始前页面禁止滚动，动画结束后添加 `is-intro-complete` 恢复滚动。

| 阶段 | 近似时间 | 画面与运动 |
| --- | ---: | --- |
| Product-minded AI Builder 与辅助文字 | 0-1540ms | 页面直接显示黄色底，中间是 `Product-minded AI Builder`，周围三处辅助文字是 `Product Builder`、`Design Engineer`、`AI Architect`。 |
| JasonQ | 1420-2480ms | `Product-minded AI Builder` 隐去，中间切换为完整 `JasonQ`。 |
| 标识变形 | 2480-3380ms | `Q` 放大，`Jason` 缩小并贴到 `Q` 左上角，模拟参考视频里 `P10` 的主标识变形。 |
| 背景横条插入 | 3520-4100ms | 中线背景横条从左向右插入，并覆盖主标识中线。 |
| 页面同步打开 | 4240-5620ms | 背景横条向上下展开，黄色上下块同步划开，首页白色 dashboard 从中线同步出现。 |
| 进入主页 | 5920ms 后 | loader 淡出，导航和滚动提示进入，页面恢复滚动。 |

## 关键类名

- `is-loaded`：页面脚本初始化后添加，立即启动开场动画。
- `is-intro-complete`：完整开场时间结束后添加，恢复页面滚动。
- 每次页面初始化都会先移除旧状态再重新添加 `is-loaded`，所以刷新页面会重新播放完整开场动画。

## 同步规则

- 横条扫描时间变量在 `styles/tokens.css` 的 `--intro-scan-start`。
- `JasonQ` 变形时间变量是 `--intro-morph-start`。
- 页面、背景和白卡同步打开由 `--intro-open-start` 与 `--intro-open-duration` 统一控制。
- loader 退场和导航入场由 `--intro-end` 控制。

## 降级策略

用户系统开启减少动效时，`prefers-reduced-motion` 会隐藏 loader，直接显示主页内容。除此之外不记录播放状态，也不因为刷新、hash 或浏览器恢复状态跳过开场。

## 语言规则

开场动画始终使用英文，不跟随主页语言切换。主页内容由 `scripts/site-config.js` 里的双语文案驱动，首次进入始终默认英文，之后可用导航中的 `EN / 中文` 控件手动切换中英文。
