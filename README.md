# Font Previewer

A lightweight, browser-based font gallery for previewing large font collections. Built for quick browsing, screenshots, screen recording, and product previews.

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
- Responsive layout
- No frameworks or external dependencies

## Repository structure

```text
font-previewer/
├── index.html
├── styles.css
├── app.js
├── fonts.js
├── fonts/
│   └── .gitkeep
└── tools/
    └── generate-font-list.ps1
```

## Add fonts

1. Upload your font files into the `fonts` folder.
2. On Windows, run `tools/generate-font-list.ps1` from the repository root.
3. Commit the regenerated `fonts.js` file.
4. Open the site through GitHub Pages.

Supported formats: `.ttf`, `.otf`, `.woff`, `.woff2`.

## Generate the font list

From PowerShell in the repository root:

```powershell
.\tools\generate-font-list.ps1
```

The script scans `fonts/` recursively and regenerates `fonts.js`.

## GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, then select:

- Branch: `main`
- Folder: `/ (root)`

Save the settings. GitHub will provide the public URL when deployment is ready.

## Notes

The browser cannot automatically enumerate files in a normal static `fonts/` directory. `fonts.js` acts as the manifest that tells the page which font files are available.
