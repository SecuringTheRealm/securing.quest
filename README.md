# securing.quest

> Securing the Realm website - An 8-bit castle-themed journey through cybersecurity, Azure, and AI.

[![Astro](https://img.shields.io/badge/Astro-5.x-orange)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![publish-to-github-pages](https://github.com/SecuringTheRealm/securingtherealm.github.io/actions/workflows/publish.yml/badge.svg)](https://github.com/SecuringTheRealm/securingtherealm.github.io/actions/workflows/publish.yml)

## About

Securing the Realm transforms complex cybersecurity and AI topics into epic adventures. Through engaging storytelling and technical demonstrations, we explore Azure innovation, Microsoft AI, and responsible technology practices—all framed within the enchanting world of tabletop gaming.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)

### Installation

```bash
bun install
```

### Development

Start the development server:

```bash
bun run dev
```

The site will be available at [http://localhost:4321](http://localhost:4321).

### Build

Build the static site for production:

```bash
bun run build
```

This will:
1. Sync YouTube videos from the Securing the Realm channel to the talks collection
2. Run TypeScript type checking
3. Build the static site

The built site will be in the `dist/` directory.

**Note**: To build without syncing YouTube videos (faster for testing), use:

```bash
bun run build:fast
```

### Linting and Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

Check for lint and format issues:

```bash
bun run lint
```

Auto-fix lint and format issues:

```bash
bun run lint:fix
```

Format code only:

```bash
bun run format
```

### Syncing YouTube Videos

The site automatically syncs videos from the [Securing the Realm YouTube channel](https://www.youtube.com/@SecuringTheRealm) into the talks collection. Videos are only added if they don't already exist (checked by videoUrl).

To manually sync YouTube videos:

```bash
bun run sync:youtube
```

This creates JSON files in `src/content/talks/` for each new video.

### Preview

Preview the production build locally:

```bash
bun run preview
```

## Project Structure

```
/
├── public/             # Static assets (favicon, images)
├── src/
│   ├── assets/         # Optimized images and assets
│   │   └── pixel/      # Pixel art assets for castle theme
│   ├── components/     # Reusable Astro components
│   ├── content/        # Content collections (blog, talks, projects)
│   │   ├── blog/       # Blog posts in Markdown/MDX
│   │   ├── talks/      # Talk metadata (JSON)
│   │   ├── projects/   # Project metadata (JSON)
│   │   └── config.ts   # Content collection schemas
│   ├── layouts/        # Page layouts
│   │   └── Base.astro  # Base HTML structure
│   ├── pages/          # File-based routing
│   │   ├── index.astro      # Home page (Castle Gate)
│   │   ├── about.astro      # Mission page
│   │   ├── blog/            # Library pages
│   │   ├── talks/           # Tower pages
│   │   ├── forge/           # Projects pages
│   │   ├── newsletter/      # Newsletter signup
│   │   └── 404.astro        # Custom 404 page
│   └── styles/         # Global styles and design tokens
│       ├── tokens.css  # CSS custom properties (colors, spacing, etc.)
│       └── global.css  # Global styles and utilities
└── astro.config.mjs    # Astro configuration
```

## Content Management

### Blog Posts

Create new blog posts in `src/content/blog/` as Markdown or MDX files:

```markdown
---
title: "Your Post Title"
description: "Brief description"
pubDate: 2025-01-15
tags: ["tag1", "tag2"]
draft: false
---

# Your content here
```

### Talks

Talks are stored in `src/content/talks/` as JSON files. You can add talks manually or sync them from YouTube.

**Manual Entry:**

Create a JSON file in `src/content/talks/`:

```json
{
  "title": "Talk Title",
  "date": "2025-01-15",
  "event": "Event Name",
  "videoUrl": "https://youtube.com/watch?v=...",
  "slidesUrl": "https://example.com/slides",
  "summary": "Talk description",
  "tags": ["Azure", "AI"]
}
```

**YouTube Sync:**

The build process automatically syncs videos from the [Securing the Realm YouTube channel](https://www.youtube.com/@SecuringTheRealm). Videos are only added if they don't already exist (checked by `videoUrl`), so manually created talk entries won't be overwritten.

To manually trigger a sync:

```bash
bun run sync:youtube
```

### Projects

Add projects to `src/content/projects/` as JSON files:

```json
{
  "name": "Project Name",
  "description": "Project description",
  "repoUrl": "https://github.com/...",
  "tech": ["TypeScript", "Azure"],
  "status": "active"
}
```

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the `main` branch. The workflow:

1. Builds the Astro site
2. Uploads the `dist/` directory as an artifact
3. Deploys to GitHub Pages

The site is available at [https://securing.quest](https://securing.quest).

## Design System

The site uses a custom design system inspired by 8-bit fantasy aesthetics:

- **Colors**: Teal background (#0f3c46), gold accents (#d5a425), parchment (#f3e9d2)
- **Typography**: Press Start 2P for headings, Georgia for body text
- **Theme**: Castle navigation with Tower (talks), Library (blog), Forge (projects), and Arcane Scrolls (newsletter)

See `src/styles/tokens.css` for the complete design token system.

## License

The site template is based on work under the [Tailwind Plus license](https://tailwindcss.com/plus/license).
All other code is MIT licensed.
Content is released under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Learn More

- [Astro Documentation](https://docs.astro.build)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
