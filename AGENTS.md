# AGENTS Guidelines

This repository uses **TypeScript** and **Astro**. Use the practices below when contributing.

**📚 For comprehensive documentation, see:**
- `docs/prd.md` - Product requirements, features, user stories, design, content strategy
- `docs/architecture.md` - Technical architecture, implementation patterns, decisions
- `.github/copilot-instructions.md` - Complete development guide with build commands
Do not update files under /docs/architecture or under /docs/prd - they are auto-generated.

## Critical Development Rules

### TypeScript Strict Mode
- **ALL** parameters must have explicit type annotations
- **NO** `any` types allowed
- Use `CollectionEntry<'blog'>` for content types
- Example: `posts.map((post: CollectionEntry<'blog'>) => { ... })`

### Design Tokens (NEVER HARDCODE)
```css
/* ✅ ALWAYS use CSS variables */
background: var(--colour-teal-bg);
padding: var(--space-4);

/* ❌ NEVER hardcode values */
background: #0f3c46;  /* BAD */
padding: 16px;        /* BAD */
```

**Critical tokens:**
- Colors: `--colour-teal-bg`, `--colour-gold`, `--colour-stone`, `--colour-parchment`
- Spacing: `--space-{1,2,3,4,6,8,12,16,20,24}` (8px base grid)
- Fonts: `--font-display` (Press Start 2P), `--font-body` (Georgia)

### Build Validation
**ALWAYS run before committing:**
```bash
bun run build  # Validates TypeScript + builds
```

**Build must pass with:**
- Zero TypeScript errors
- Zero Biome errors (warnings OK)
- Successful Astro compilation

### Content Collections Pattern
```typescript
// src/pages/blog/index.astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

// MUST type the parameter explicitly
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

## Accessibility (WCAG AA Required)

### Non-Negotiable Requirements
- **Semantic HTML**: Use `<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`
- **ARIA labels**: All interactive elements without visible text need `aria-label`
- **Color contrast**: ≥4.5:1 (validated)
- **Keyboard nav**: Tab, Enter, Escape must work
- **Skip-to-content**: First focusable element
- **Alt text**: ALL images (including decorative SVGs)
- **Reduced motion**: Disable animations with `@media (prefers-reduced-motion: reduce)`

---

## General Best Practices

- Follow functional programming style (immutable data, `const`, `readonly`)
- Use interfaces for data structures
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Write comments in US English
- Ensure responsive design across all breakpoints

## TypeScript and Naming

- Use `PascalCase` for component names, interfaces, type aliases
- Use `camelCase` for variables, functions, methods
- Prefix private members with underscore (`_`)
- Use `ALL_CAPS` for constants

## Astro Component Guidelines

- Define props using TypeScript interfaces in frontmatter
- Keep components small and focused
- Scope styles within component
- Use `class:list` directive for conditional styling

---

## SVG and Pixel Art Guidelines (8-Bit Retro Theme)

**Critical Standards:**
- **8px grid**: All coordinates snap to multiples of 4 or 8
- **2px stroke**: Unified stroke width across all elements
- **CSS variables ONLY**: Never hardcode hex colors
- **Reusable symbols**: Use `<defs><symbol>` and `<use href="#id">`
- **Unique IDs**: Prefix with `uid` to avoid collisions
- **Typography**: Press Start 2P, 11px, single words only
- **Animations**: Respect `@media (prefers-reduced-motion: reduce)`

### Implementation Checklist

When creating or modifying SVG components:

- [ ] All coordinates snap to 8px grid
- [ ] Stroke width is consistently 2px
- [ ] Colors use CSS variables from `tokens.css`
- [ ] Lighting direction matches scene (moon top-right)
- [ ] Cast shadows present on ground
- [ ] Reusable elements defined as `<symbol>` in `<defs>`
- [ ] Typography uses Press Start 2P, 11px, single words
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Focus and hover states implemented
- [ ] ARIA labels and SVG metadata complete
- [ ] File tested at 50% scale for legibility

**For detailed SVG guidelines, see `docs/prd.md` Design Requirements section.**

---

## Common Pitfalls (Castle Scene Reference)

When building or modifying the castle scene (or any SVG component) in Astro, watch for these recurring issues:

1. Gradient Scope
  - ISSUE: Defining `<linearGradient>` outside of `<defs>` causes a silent fallback (no gradient rendered).
  - FIX: Always wrap gradients, patterns, symbols inside a single `<defs>` block.
2. ID Collisions
  - ISSUE: Multiple instances of the component on a page can duplicate IDs (`#sky`, `#tile-wall`).
  - FIX: Add a `const uid = Math.random().toString(36).slice(2)` prefix (or a passed `idPrefix` prop) and concatenate (e.g. `id={`${uid}-sky`}`).
3. Blurry Pixels
  - ISSUE: Downscaled SVG with sub‑pixel coordinates or missing crisp rendering.
  - FIX: Ensure all coordinates are multiples of 4 / 8, add `shape-rendering="crispEdges"` and CSS `image-rendering: pixelated;`.
4. Stroke Scaling Artifacts
  - ISSUE: Scaling via CSS width/height percentages can visually thin strokes.
  - FIX: Design at target aspect ratio (1200×600). Avoid non-uniform scaling or apply only max-width constraints.
5. Excessive DOM Weight
  - ISSUE: Naively tiling hundreds of 16×16 `<use>` nodes impacts HTML size.
  - FIX: Use selective decorative tiles (chips) and large base rectangles for flat fills when acceptable for ‘retro’ mode.
6. Unused Frontmatter Data
  - ISSUE: Declaring arrays in frontmatter but still hardcoding loops in template (linter flags unused variables).
  - FIX: Either map over the declared arrays or remove them. Keep all dynamic generation in frontmatter for clarity.
7. Colour Drift / Hardcoded Hex
  - ISSUE: Direct hex values break design token theming.
  - FIX: Always reference `var(--colour-*)` tokens. Add missing tokens first before use.
8. Accessibility Gaps
  - ISSUE: SVG lacks `<title>` / `<desc>` or interactive anchors missing `aria-label`.
  - FIX: Provide `<title>` & `<desc>`, and ensure each clickable region is an `<a>` with descriptive `aria-label`.
9. Improper Layer Order
  - ISSUE: Roof or battlements rendered below wall rectangles due to group order.
  - FIX: Render background (sky, ground) → large wall masses → structural accents (roofs, crenels) → details (windows, doors, labels) → FX (orb, smoke, shadows).
10. Animated FX Violating Reduced Motion
   - ISSUE: Infinite animations not disabled for `prefers-reduced-motion`.
   - FIX: Gate `@keyframes` usage with a media query override.
11. Missing Unique Shadows / Depth
   - ISSUE: Flat rectangles obscure silhouette.
   - FIX: Add 1‑tile highlight band (right edge) and shadow band (left edge) per style guide (opacity 0.10–0.25).
12. Overusing Filters
   - ISSUE: Filter effects (blur/glow) degrade retro sharpness & performance.
   - FIX: Use simple opacity pulses or layered flat shapes (no `filter`, `feGaussianBlur`).

---

## Linting and Formatting

- Use **Biome** for linting and formatting. Run `bun run lint` or `biome check .` before committing.
- Use `bun run lint:fix` or `biome check --write .` to automatically fix issues.
- Use `bun run format` or `biome format --write .` for formatting.

## Package Manager

- This project uses **Bun** as its package manager and task runner.
- Use `bun install` to install dependencies, `bun run <script>` to run scripts.
- Use `bun run test` to run linting and type checks before committing.
- Do **not** use `npm` or `yarn` — the lockfile is `bun.lock`.
