# Font Previewer

A fast, lightweight **online font previewer and browser font tester** for previewing large collections of **TTF, OTF, WOFF and WOFF2 fonts**. Use bundled fonts from GitHub Pages or open a local font folder directly from your computer without uploading the files anywhere.

## Live Font Previewer

**Open the tool:** https://codemasterhub-com.github.io/font-previewer/

**CodeMasterHub:** https://codemasterhub.com

Font Previewer is designed for font browsing, typography testing, screenshots, screen recording, digital-product previews and quickly comparing hundreds or thousands of fonts in one place.

## Features

- Preview **local fonts directly in your browser**
- Open an entire local font folder, including subfolders
- Local font files stay on your computer and are not uploaded to GitHub or another server
- Load bundled fonts from the repository `fonts/` folder when no local folder is selected
- Supports **TTF, OTF, WOFF and WOFF2** font files
- Custom preview text for testing words, names, titles and phrases
- Search fonts by filename or font name
- 1–8 column responsive font grid
- Adjustable font size and preview card height
- Show or hide font names
- Presentation mode for clean font previews
- Fullscreen mode for screenshots and screen recording
- Light and dark themes
- Lazy font loading for better performance with large font collections
- No frameworks or external dependencies
- Automatic bundled-font manifest generation during GitHub Pages deployment

## Preview Local Fonts

The easiest way to use Font Previewer is through the live version:

https://codemasterhub-com.github.io/font-previewer/

1. Click **Open Local Folder**.
2. Select a folder containing font files on your computer.
3. The browser finds supported `.ttf`, `.otf`, `.woff` and `.woff2` files in that folder and its subfolders.
4. The fonts are loaded directly in your browser for previewing.

Your local font files are **not uploaded**. They remain on your computer and are only read by the browser for the current preview session.

## Bundled Fonts from GitHub

Font Previewer can also display fonts stored in the repository `fonts/` folder.

When no local folder is selected, the app uses the bundled font list generated in `fonts.js` and loads those font files from GitHub Pages as needed.

To add bundled fonts:

1. Upload font files to the `fonts/` folder.
2. Commit the changes to `main`.
3. GitHub Actions automatically scans `fonts/`, generates `fonts.js` and deploys the updated Font Previewer.

Subfolders inside `fonts/` are supported.

## Repository Structure

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

## Using the Font Previewer

- Enter anything in **Preview text** to test it across all loaded fonts.
- Choose **1–8 columns** to control how many font previews appear on each row.
- Adjust **Font size** and **Card height** for the layout you need.
- Use **Search** to quickly find a specific font.
- Disable **Names** for a cleaner visual preview.
- Use **Presentation** mode to hide the controls.
- Use **Fullscreen** for screen recording or screenshots.
- Click **Use Bundled Fonts** to switch back from local fonts to the fonts hosted with the project.

Layout preferences are saved in the browser for future visits.

## Optional Local Manifest Generation

If you are developing the project locally and want to generate a bundled-font manifest manually, use either of these methods from the repository root.

### Windows PowerShell

```powershell
.\tools\generate-font-list.ps1
```

### Node.js

```bash
node tools/generate-font-list.mjs
```

Both scripts recursively scan the `fonts/` folder and regenerate `fonts.js`.

## Why `fonts.js` Exists

A static website cannot automatically enumerate files inside a server directory using normal client-side JavaScript. The generated `fonts.js` manifest tells the browser which bundled font files exist.

This manifest is only needed for the fonts hosted with the project. **Local font previewing does not require `fonts.js`** because selected local files are read directly by the browser.

## About CodeMasterHub

Font Previewer is a free browser-based font utility by **CodeMasterHub**.

Visit: https://codemasterhub.com
