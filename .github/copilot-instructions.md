# Copilot Coding Agent Instructions for Securing the Realm

## Repository Overview

**Securing the Realm** is a static website built with **Astro** that transforms cybersecurity, Azure, and AI content into an 8-bit fantasy castle-themed experience. The site uses TypeScript strict mode, content collections for type-safe content management, and custom CSS properties for theming. **Deployment**: GitHub Pages Static at https://securing.quest

## Build & Development Commands

### Essential Prerequisites

**ALWAYS run `bun install` first** - The repository requires dependencies to be installed before any other command will work.

### Command Sequence (Validated)

```bash
# 1. Install dependencies (REQUIRED FIRST STEP)
bun install
# Time: ~30-60 seconds
# Postcondition: node_modules/ exists, bun.lock updated

# 2. Development server
bun run dev
# or
bun start
# Time: Starts in ~2 seconds
# URL: http://localhost:4321
# Hot module replacement: ✅ Enabled
# Postcondition: Server running, can access site locally

# 3. Linting (Biome)
bun run lint
# Time: ~2 seconds
# Checks formatting, imports, and code quality
# Exit code 0: All checks pass (may have warnings)

# 3a. Auto-fix lint issues
bun run lint:fix
# Time: ~3 seconds
# Fixes formatting and import organization
# Safe fixes applied automatically

# 3b. Format only
bun run format
# Time: ~2 seconds
# Formats code without linting

# 4. Type checking (runs automatically before build)
npx astro check
# Time: ~5 seconds
# Must pass with 0 errors before build succeeds

# 5. Production build
bun run build
# Time: ~1.8 seconds
# Output: dist/ directory with static HTML/CSS/JS
# Postcondition: dist/ contains 9+ HTML pages, assets, sitemap

# 6. Preview production build
bun run preview
# Time: Starts in ~1 second
# URL: http://localhost:4321 (or 4322 if 4321 is busy)
# Postcondition: Serves content from dist/
```

### Linting & Formatting

**Biome** is used for linting and formatting (replaced ESLint and Prettier).

- **Configuration**: `biome.json`
- **Lint**: `bun run lint` - Check code quality, formatting, import organization
- **Fix**: `bun run lint:fix` - Auto-fix safe issues
- **Format**: `bun run format` - Format code only
- **Note**: Warnings are acceptable; only errors block CI/CD

### Runtime Versions

- **Bun**: latest (package manager and task runner)
- **Node.js**: 18+ (used by Astro/Vite under the hood)
- **TypeScript**: 5.9.3 (installed via bun)
- **Astro**: 5.15.9+

### Common Issues & Solutions

**Issue**: `sh: astro: not found`

- **Cause**: Dependencies not installed
- **Solution**: Run `bun install` first

**Issue**: Biome binary not found after `bun install`

- **Cause**: Bun may block postinstall scripts
- **Solution**: Run `bun pm trust @biomejs/biome` then `bun install` again

**Issue**: Build fails with TypeScript errors

- **Cause**: Strict mode enabled, type annotations missing
- **Solution**: All parameters must be explicitly typed. Use `CollectionEntry<'blog'>` for content types

**Issue**: Port 4321 already in use

- **Behavior**: Astro automatically tries 4322, 4323, etc.
- **Solution**: No action needed, check console for actual port

## Project Architecture

### Directory Structure

```
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   │   └── publish.yml      # Main deployment workflow
│   └── copilot-instructions.md  # This file
├── public/                  # Static assets (copied as-is to dist/)
│   ├── CNAME               # Custom domain: securing.quest
│   ├── favicon.svg         # Site icon
│   ├── robots.txt          # Search engine rules
│   └── str-logo.png        # Logo image
├── src/
│   ├── components/         # Reusable Astro components
│   │   └── Seo.astro      # SEO meta tags, OpenGraph, JSON-LD
│   ├── content/           # Type-safe content collections
│   │   ├── blog/          # Markdown/MDX blog posts
│   │   ├── talks/         # JSON talk metadata
│   │   ├── projects/      # JSON project metadata
│   │   └── config.ts      # Zod schemas for validation
│   ├── layouts/
│   │   └── Base.astro     # HTML scaffold, header, footer
│   ├── pages/             # File-based routing
│   │   ├── index.astro    # Homepage
│   │   ├── about.astro    # About page
│   │   ├── 404.astro      # Custom error page
│   │   ├── blog/          # Blog routes
│   │   │   ├── index.astro     # Blog list
│   │   │   ├── [slug].astro    # Blog post template
│   │   │   └── rss.xml.ts      # RSS feed generator
│   │   ├── talks/index.astro   # Talks list
│   │   ├── forge/index.astro   # Projects list
│   │   └── newsletter/index.astro  # Newsletter signup
│   └── styles/
│       ├── tokens.css     # Design tokens (colors, spacing, typography)
│       └── global.css     # Global styles, animations
├── astro.config.mjs       # Astro configuration
├── tsconfig.json          # TypeScript strict mode config
├── package.json           # Dependencies and scripts
├── README.md              # User-facing documentation
├── CONTRIBUTING.md        # Contributor guidelines
└── DESIGN.md              # Design system documentation
```

### Key Configuration Files

1. **astro.config.mjs**: Configures integrations (MDX, sitemap, RSS)
2. **tsconfig.json**: Strict mode enabled - all types must be explicit
3. **src/content/config.ts**: Zod schemas define content structure
4. **src/styles/tokens.css**: Design system variables (ALWAYS use these, never hardcode colors/spacing)

### Design System (CRITICAL)

**ALWAYS use design tokens from `src/styles/tokens.css`**. Never hardcode colors or spacing.

**Color Palette:**

- `--colour-teal-bg: #0f3c46` - Primary background
- `--colour-gold: #d5a425` - Accents, CTAs, headings
- `--colour-stone: #8a877f` - Secondary text
- `--colour-parchment: #f3e9d2` - Light backgrounds

**Typography:**

- Headings: Press Start 2P (8-bit pixel font)
- Body: Georgia serif
- Code: Courier New monospace

**Spacing Scale:** `--space-{1,2,3,4,6,8,12,16,20,24}` (4px increments)

**Castle Navigation Metaphor:**

- Tower → `/talks/` (Video presentations)
- Library → `/blog/` (Blog posts)
- Forge → `/forge/` (Code projects)
- Arcane Scrolls → `/newsletter/` (Newsletter)

## Content Collections (Type-Safe)

### Adding Content

**Blog Post** (`src/content/blog/filename.md`):

```markdown
---
title: 'Post Title'
description: 'Brief description'
pubDate: 2025-01-15
tags: ['tag1', 'tag2']
draft: false
---

# Content here
```

**Talk** (`src/content/talks/talk-name.json`):

```json
{
  "title": "Talk Title",
  "date": "2025-01-15",
  "event": "Event Name",
  "videoUrl": "https://youtube.com/watch?v=...",
  "slidesUrl": "https://example.com/slides",
  "summary": "Description",
  "tags": ["Azure", "AI"]
}
```

**Project** (`src/content/projects/project-name.json`):

```json
{
  "name": "Project Name",
  "description": "Description",
  "repoUrl": "https://github.com/...",
  "tech": ["TypeScript", "Azure"],
  "status": "active"
}
```

### TypeScript Types

**ALWAYS use explicit types** (strict mode enabled):

```typescript
import type { CollectionEntry } from 'astro:content';

// For blog posts
const posts: CollectionEntry<'blog'>[]

// For talks
const talks: CollectionEntry<'talks'>[]

// For projects
const projects: CollectionEntry<'projects'>[]

// In map functions, ALWAYS type the parameter
posts.map((post: CollectionEntry<'blog'>) => { ... })
```

## CI/CD & Deployment

### GitHub Actions Workflow (.github/workflows/publish.yml)

**Triggers:**

- Push to `main` branch
- Daily cron: 0 0 \* \* \* (checks for YouTube feed updates)

**Steps:**

1. Checkout code
2. Setup Bun (via oven-sh/setup-bun@v2)
3. Run `bun install --frozen-lockfile`
4. Run `bun run build` (includes type checking)
6. Upload `dist/` as artifact
7. Deploy to GitHub Pages

**Build Validation:**

- TypeScript must pass with 0 errors
- Astro check must succeed
- Build must produce `dist/` with all pages

### Pre-Commit Checks

Before committing, ALWAYS run:

```bash
bun run build  # Validates TypeScript and builds
```

If build fails, fix TypeScript errors first. Common issues:

- Missing type annotations on function parameters
- Using `any` type (not allowed in strict mode)
- Incorrect collection types

## Making Changes

### Typical Development Flow

1. **Create/edit content**:

   - Blog: Add `.md` file to `src/content/blog/`
   - Talk: Add `.json` to `src/content/talks/`
   - Project: Add `.json` to `src/content/projects/`

2. **Create/edit components**:

   - Add `.astro` files to `src/components/`
   - ALWAYS use design tokens from `tokens.css`
   - Follow semantic HTML (header, nav, main, footer)

3. **Create/edit pages**:

   - Add `.astro` files to `src/pages/`
   - Use `Base.astro` layout
   - Include `Seo.astro` component for metadata

4. **Test locally**:

   ```bash
   bun run dev  # Hot reload enabled
   ```

5. **Validate**:
   ```bash
   bun run build  # Must pass before committing
   ```

### Accessibility Requirements (WCAG AA)

- Use semantic HTML5 elements
- Add `aria-label` to all interactive elements without visible text
- Ensure color contrast ≥ 4.5:1
- Include skip-to-content link
- All images need `alt` text
- Keyboard navigation must work (test with Tab key)

### Common Patterns

**Creating a new page:**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="Page Title" description="Page description">
  <div class="container" style="padding: var(--space-16) var(--space-4);">
    <h1>Page Heading</h1>
    <!-- Content -->
  </div>
</Base>
```

**Using content collections:**

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

const posts = await getCollection('blog');
const sorted = posts.sort((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
  b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

{sorted.map((post: CollectionEntry<'blog'>) => (
  <article>
    <h2>{post.data.title}</h2>
  </article>
))}
```

## Performance Targets

- LCP (Largest Contentful Paint): ≤ 2.5s
- Total JavaScript: ≤ 80KB
- CLS (Cumulative Layout Shift): ≤ 0.1
- Build time: ~1.6s for 9 pages

## Important Notes

1. **Trust these instructions**: Only search the codebase if information here is incomplete or incorrect
2. **Always `bun install` first**: No other command will work without dependencies. Use Bun, not npm or yarn.
3. **Use design tokens**: Never hardcode colors (`#0f3c46`) or spacing (`16px`), use CSS variables
4. **Type everything**: Strict mode requires explicit types on all function parameters
5. **Test the build**: Run `bun run build` before committing to catch TypeScript errors
6. **Accessibility matters**: All interactive elements need proper ARIA labels and keyboard support
7. **Castle theme**: Maintain the fantasy/gaming metaphor in all content and UI elements
8. **Biome linting**: Run `bun run lint` and `bun run lint:fix` regularly to keep code clean. Resolve warnings if possible.

### Common Astro SVG Issues (Castle Scene)

| Problem                          | Symptom                                 | Resolution                                                                          |
| -------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| Gradient outside `<defs>`        | Gradient ignored / flat fill            | Move gradient into `<defs>` and reference by `url(#id)`                             |
| ID collisions                    | Multiple components override shared IDs | Prefix IDs with a locally scoped `uid` in frontmatter                               |
| Blurry / soft edges              | Pixel art looks smeared                 | Use 8px grid alignment, `shape-rendering: crispEdges`, `image-rendering: pixelated` |
| Too many tile `<use>` nodes      | Large DOM, slow dev refresh             | Replace bulk tiles with single base rect + sparse decorative chips                  |
| Hardcoded colours                | Theme drift, inconsistent palette       | Always use CSS variables from `tokens.css`                                          |
| Missing accessibility metadata   | Screen readers announce nothing         | Include `<title>` and `<desc>` plus `aria-label` on interactive links               |
| Animations ignore reduced motion | Accessibility violation                 | Disable animations inside `@media (prefers-reduced-motion: reduce)`                 |
| No light/shadow bands            | Flat silhouettes, poor depth            | Add 1 tile (8px) highlight (right) & shadow (left) bands at proper opacity          |
| Filters used for glow            | Performance + visual blur               | Use opacity pulse layers (no `filter`, `blur`, `drop-shadow`)                       |
| Unused frontmatter arrays        | Lint warnings                           | Either map them in template or remove unused declarations                           |
| Improper layer order             | Elements render behind others           | Render order: background → walls → roofs → details → FX                             |

## Documentation Files

- `README.md`: User-facing setup guide
- `DESIGN.md`: Complete design system reference
- `docs/adr/index.md`: Architectural decision records

**When in doubt**: Check these documentation files for detailed information on design patterns, coding standards, and architectural decisions.
