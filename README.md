# JasonQ Personal Website

Static personal homepage for JasonQ. The site keeps a no-build architecture so it can be opened directly or deployed as static files, while the source is split by responsibility.

The opening animation now runs as `Product-minded AI Builder + Product Builder/Design Engineer/AI Architect -> JasonQ -> Q grows while Jason docks above it -> background strip scans left-to-right -> page opens`. The opening animation stays English. The main page defaults to English, with a dedicated `EN / 中文` control in the navigation for manual language switching. Scrolling moves into one full-screen project section per project.

## Run

Open `index.html` directly in a browser, or serve the folder locally:

```sh
python3 -m http.server 5173
```

Then visit `http://127.0.0.1:5173`.

## Structure

- `index.html` - semantic page structure and component mount points.
- `styles.css` - stylesheet entry that imports files from `styles/`.
- `styles/tokens.css` - design tokens and animation timing variables.
- `styles/sections/` - page-level section styles for home and projects.
- `styles/components/` - reusable component styles, including the opening loader.
- `styles/responsive.css` - breakpoints and reduced motion states.
- `scripts/site-config.js` - intro settings, bilingual copy, and project registry.
- `scripts/intro-controller.js` - intro state reset, replay, and completion state.
- `scripts/site.js` - page bootstrap, language switching, and project metadata sync.
- `assets/avatar.jpg` - profile avatar converted from the original HEIC image.
- `assets/logo-unsw.png` / `assets/logo-samsung.png` - local education and company logo assets copied from official website assets.
- `assets/logo-*.svg` - local logo assets for official/mainstream stack marks such as MCP, LangGraph, PyTorch, AI SDK, OpenCode, and Go. RAG, Skills, and CI/CD use text badges because they are capabilities rather than stable standalone brand marks.
- `docs/` - Chinese documentation for animation and architecture.

## Notes

Replace project copy and project links with real content when ready. Tech stack logos use local official/mainstream website assets where brand fidelity matters and devicon CDN assets for common framework/runtime marks.
