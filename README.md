# Vinay Anand Bhaskarla — Interactive Resume

This repository contains the source code for my **interactive resume / portfolio site**, built with **React + TypeScript + Vite + Tailwind CSS**, and deployed on **GitHub Pages**.

## Live

- **Stable**: `https://vinayanand3.github.io/vinay-resume-interactive/`
- **Preview** (optional, published under a sub-path): `https://vinayanand3.github.io/vinay-resume-interactive/preview/`

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- GitHub Pages deploy via `gh-pages`

## Getting started (local dev)

```bash
npm install
npm run dev
```

Vite will print the local URL in the terminal.

## Build

```bash
npm run build
```

## Deploy (GitHub Pages)

This repo deploys the built site to the **`gh-pages`** branch.

### One command (stable + preview together)

```bash
npm run deploy
```

This publishes:
- `/vinay-resume/` (stable)
- `/vinay-resume/preview/` (preview)

### Preview only

```bash
npm run deploy:preview
```

## Where to edit content

- **Resume data (experience, education, projects, skills)**: `constants.ts`
- **Main layout + sections**: `App.tsx`
- **Timeline component**: `components/Timeline.tsx`

## Assets / PDFs / images

- **Resume PDF (for “View Full Resume”)**: `public/Vinay_Bhaskarla_Resume.pdf`
- **Professional Journey PDF (header icon)**: `public/projects/professional_journey.pdf`
- **Project images**: `public/projects/<project-folder>/...`

When adding/changing images, keep filenames URL-safe (no spaces) to avoid GitHub Pages caching/encoding issues.

## GitHub Pages settings

In GitHub: **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: **`gh-pages`**
- Folder: **`/ (root)`**

## Notes

- The `gh-pages` branch is **generated build output**. Don’t hand-edit it.
- If you don’t see a freshly deployed change immediately, it’s usually caching. Try:
  - Hard refresh (Cmd+Shift+R), or
  - Open `index.html` directly with a cache-busting query, e.g. `.../index.html?nocache=1`.
