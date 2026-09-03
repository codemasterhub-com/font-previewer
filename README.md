# Font Previewer

A lightweight browser-based font gallery for previewing large font collections. It is designed for browsing, screenshots, screen recording and digital-product previews.

## Features

- Loads fonts from the repository `fonts/` folder
- Supports TTF, OTF, WOFF and WOFF2
- 1–8 column grid
- Custom preview text
- Adjustable font size and card height
- Search by font name
- Show/hide font names
- Presentation mode for clean screen recording
- Fullscreen mode
- Light and dark themes
- Responsive layout
- Lazy font loading for large collections
- No frameworks or external dependencies
- Automatic font manifest generation during GitHub Pages deployment

## Repository structure

```text
font-previewer/
├── .github/
│   └── workflows/
│       └── pages.yml
├── fonts/
│   └── .gitkeep
├── tools/
│   ├── generate-font-list.mjs
│   └── generate-font-list.ps1
├── index.html
├── styles.css
├── app.js
├── fonts.js
└── .nojekyll
```

## Add fonts

The easiest workflow is:

1. Upload your font files into the `fonts/` folder on GitHub.
2. Commit the upload to `main`.
3. GitHub Actions automatically scans `fonts/`, generates `fonts.js`, and deploys the updated site.

You do **not** need to manually edit `fonts.js` when using the included GitHub Pages workflow.

Supported formats: `.ttf`, `.otf`, `.woff`, `.woff2`.

Subfolders inside `fonts/` are supported too.

## Enable GitHub Pages once

Open the repository and go to:

**Settings → Pages → Build and deployment → Source**

Choose:

**GitHub Actions**

After that, every push to `main` automatically rebuilds and publishes the previewer.

## Optional local manifest generation

### Windows PowerShell

From the repository root:

```powershell
.\tools\generate-font-list.ps1
```

### Node.js

```bash
node tools/generate-font-list.mjs
```

Both scripts scan the `fonts/` folder recursively and regenerate `fonts.js`.

## Using the previewer

- Enter any text in **Preview text**.
- Choose **1–8 columns** depending on how many fonts you want visible at once.
- Adjust **Font size** and **Card height**.
- Use **Names** to hide filenames from a clean recording.
- Use **Presentation** to remove the toolbar.
- Use **Fullscreen** for screen recording.
- Search by filename when you need a specific font.

The selected layout settings are saved in the browser for the next visit.

## Why `fonts.js` exists

Static websites cannot enumerate files inside a server directory from client-side JavaScript. The generated `fonts.js` manifest tells the browser exactly which font files exist. On GitHub Pages this manifest is generated automatically by the included deployment workflow.
