# JasonQ Personal Website

Static personal homepage for JasonQ. The site uses Vite for local hot reload and production packaging, while the deployed output remains plain static files.

The opening animation now runs as `Product-minded AI Builder + Product Builder/Design Engineer/AI Architect -> JasonQ -> Q grows while Jason docks above it -> background strip scans left-to-right -> page opens`. The opening animation stays English. The main page defaults to English, with a dedicated `EN / 中文` control in the navigation for manual language switching. Scrolling moves into one full-screen project section per project.

## Run

Install dependencies once:

```sh
npm install
```

Start the local development server with hot reload:

```sh
npm run dev
```

Then visit `http://127.0.0.1:5500`.

Build production static files into `dist/`:

```sh
npm run build
```

## Structure

- `index.html` - semantic page structure and component mount points.
- `package.json` - Vite development, build, and preview scripts.
- `styles.css` - stylesheet entry that imports files from `styles/`.
- `styles/tokens.css` - design tokens and animation timing variables.
- `styles/sections/` - page-level section styles for home and projects.
- `styles/components/` - reusable component styles, including the opening loader.
- `styles/responsive.css` - breakpoints and reduced motion states.
- `scripts/site-config.js` - intro settings, bilingual copy, and project registry.
- `scripts/intro-controller.js` - intro state reset, replay, and completion state.
- `scripts/site.js` - page bootstrap, language switching, and project metadata sync.
- `scripts/main.js` - Vite module entry that loads site scripts in order.
- `assets/avatar.jpg` - profile avatar converted from the original HEIC image.
- `assets/logo-unsw.png` / `assets/logo-samsung.png` - local education and company logo assets copied from official website assets.
- `assets/home-bg-warm-studio.jpg` - local first-screen background image.
- `assets/logo-*.svg` - local logo assets for official/mainstream stack marks such as MCP, LangGraph, PyTorch, AI SDK, Go, and common devicon marks. RAG, Workflow, Skills, and CI/CD use text badges because they are capabilities rather than stable standalone brand marks.
- `docs/` - Chinese documentation for animation and architecture.

## Notes

Replace project copy and project links with real content when ready. Remote first-screen and tech stack assets have been downloaded into `assets/` so the deployed site does not depend on Unsplash or devicon CDN at runtime.
