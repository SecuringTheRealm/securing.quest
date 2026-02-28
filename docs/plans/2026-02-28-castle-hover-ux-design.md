# Castle SVG Hover UX Improvements — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve castle SVG hover interactions — replace ugly gold rectangle overlays with outline glows, swap conceptual labels for content-type labels, and fix scale jitter.

**Architecture:** All changes in a single Astro component. SVG markup edits (labels, glow rects) + scoped CSS edits (hover rules, transitions). No new files, no new dependencies.

**Tech Stack:** Astro, SVG, CSS (scoped)

---

## Design Reference

| Current label | New primary | Hover subtitle |
|---------------|------------|----------------|
| TOWER         | TALKS      | The Tower      |
| LIBRARY       | BLOG       | The Library    |
| FORGE         | PROJECTS   | The Forge      |
| MOON          | SHORTS     | The Moon       |
| NEWSLETTER    | NEWSLETTER | Arcane Scrolls |

---

### Task 1: Update CSS — hover motion and glow rules

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:1427-1465` (scoped `<style>` block)

**Step 1: Replace scale with translateY in hover rule**

In the `<style>` block, change the `.castle-section:hover` rule (line 1432-1434):

```css
/* BEFORE */
.castle-section:hover {
  transform: scale(1.02);
}

/* AFTER */
.castle-section:hover {
  transform: translateY(-2px);
}
```

**Step 2: Replace `.section-hover` rules with `.section-glow` rules**

Replace the `.section-hover` block (lines 1441-1447):

```css
/* BEFORE */
.section-hover {
  transition: opacity 0.25s ease-in-out;
}

.castle-section:hover .section-hover {
  opacity: 0.15;
}

/* AFTER */
.section-glow {
  transition: opacity 0.25s ease-in-out;
}

.castle-section:hover .section-glow {
  opacity: 0.25;
}
```

**Step 3: Add `.castle-subtitle` hover rule**

After the `.castle-section:hover .castle-label` rule (line 1453-1455), add:

```css
.castle-subtitle {
  transition: opacity 0.25s ease-in-out;
}

.castle-section:hover .castle-subtitle {
  opacity: 0.7;
}
```

**Step 4: Update `prefers-reduced-motion` override**

In the `@media (prefers-reduced-motion: reduce)` block (line 1791), the existing `transform: none` rule already covers `translateY`. No change needed.

**Step 5: Build to verify CSS compiles**

Run: `bun run build`
Expected: Build succeeds (CSS rules are valid even though SVG markup hasn't changed yet — unused classes are fine).

**Step 6: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "style: update castle hover CSS — glow, lift, subtitle rules"
```

---

### Task 2: Update Moon section — label MOON → SHORTS + subtitle

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:122-160` (Moon section)

**Step 1: Update aria-label and data attribute**

Line 122: change the `<a>` tag:

```html
<!-- BEFORE -->
<a href="/shorts/" aria-label="Moon - Watch short videos" data-castle-nav="Shorts">

<!-- AFTER -->
<a href="/shorts/" aria-label="Shorts - Watch short videos" data-castle-nav="Shorts">
```

**Step 2: Change label text MOON → SHORTS**

Line 151-158: change the `<text>` element:

```html
<!-- BEFORE -->
<text x="1080" y="184" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="11" letter-spacing="1">MOON</text>

<!-- AFTER -->
<text x="1080" y="184" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="11" letter-spacing="1">SHORTS</text>
```

**Step 3: Add subtitle "The Moon" below the label**

After the SHORTS `<text>` element, add:

```html
<text x="1080" y="198" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="7" opacity="0"
  class="castle-subtitle">The Moon</text>
```

Position `y="198"` is 14px below the main label `y="184"`.

**Step 4: Build to verify**

Run: `bun run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "feat: rename Moon label to SHORTS with hover subtitle"
```

---

### Task 3: Update Tower section — label, glow, aria-label

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:292-434` (Tower section)

**Step 1: Update aria-label**

Line 292:

```html
<!-- BEFORE -->
<a href="/talks/" aria-label="Tower - View video talks" data-castle-nav="Tower">

<!-- AFTER -->
<a href="/talks/" aria-label="Talks - View video talks" data-castle-nav="Tower">
```

**Step 2: Change label TOWER → TALKS**

Line 407-415: change the `<text>`:

```html
<!-- BEFORE -->
letter-spacing="1">TOWER</text>

<!-- AFTER -->
letter-spacing="1">TALKS</text>
```

**Step 3: Add subtitle "The Tower"**

After the TALKS `<text>` element (after line 415), add:

```html
<text x="240" y="102" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="7" opacity="0"
  class="castle-subtitle">The Tower</text>
```

Position `y="102"` is 14px below main label `y="88"`.

**Step 4: Replace section-hover rect with section-glow rect**

The Tower main wall is at `x=160, y=120, w=160, h=320`.
Replace the `<rect class="section-hover">` (lines 425-432):

```html
<!-- BEFORE -->
<rect x="160" y="96" width="160" height="344"
  fill="var(--colour-gold)" opacity="0" class="section-hover"></rect>

<!-- AFTER — glow rect: 4px wider/taller than main wall, centred behind it -->
<rect x="158" y="118" width="164" height="324"
  fill="var(--colour-gold)" opacity="0" class="section-glow"></rect>
```

**Step 5: Build to verify**

Run: `bun run build`
Expected: Build succeeds.

**Step 6: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "feat: rename Tower label to TALKS, replace hover rect with glow"
```

---

### Task 4: Update Library section — label, glow, aria-label

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:437-669` (Library section)

**Step 1: Update aria-label**

Line 437:

```html
<!-- BEFORE -->
<a href="/blog/" aria-label="Library - Read blog posts" data-castle-nav="Library">

<!-- AFTER -->
<a href="/blog/" aria-label="Blog - Read blog posts" data-castle-nav="Library">
```

**Step 2: Find and change the Library label text**

The Library label `<text>` is at line 643 (`x="460" y="168"`). Change `LIBRARY` to `BLOG`. Add subtitle after it:

```html
<text x="460" y="182" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="7" opacity="0"
  class="castle-subtitle">The Library</text>
```

**Step 3: Replace section-hover with section-glow**

The Library main wall is at `x=360, y=240, w=200, h=200`.
Replace the `<rect class="section-hover">` (lines 660-667):

```html
<!-- BEFORE -->
<rect x="360" y="180" width="210" height="260"
  fill="var(--colour-gold)" opacity="0" class="section-hover"></rect>

<!-- AFTER -->
<rect x="358" y="238" width="204" height="204"
  fill="var(--colour-gold)" opacity="0" class="section-glow"></rect>
```

**Step 4: Build to verify**

Run: `bun run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "feat: rename Library label to BLOG, replace hover rect with glow"
```

---

### Task 5: Update Forge section — label, glow, aria-label

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:909-1303` (Forge section)

**Step 1: Update aria-label**

Line 910:

```html
<!-- BEFORE -->
<a href="/forge/" aria-label="Forge - Explore code projects" data-castle-nav="Forge">

<!-- AFTER -->
<a href="/forge/" aria-label="Projects - Explore code projects" data-castle-nav="Forge">
```

**Step 2: Change label FORGE → PROJECTS and add subtitle**

The Forge label `<text>` is at line 1277 (`x="960" y="248"`). Change `FORGE` to `PROJECTS`. Add subtitle after it:

```html
<text x="960" y="262" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="7" opacity="0"
  class="castle-subtitle">The Forge</text>
```

**Step 3: Replace section-hover with section-glow**

The Forge spans walls from `x=880` to `x=1040` (width 160), `y=280` to `y=440` (height 160).
Replace the `<rect class="section-hover">` (lines 1294-1301):

```html
<!-- BEFORE -->
<rect x="880" y="200" width="160" height="240"
  fill="var(--colour-gold)" opacity="0" class="section-hover"></rect>

<!-- AFTER -->
<rect x="878" y="278" width="164" height="164"
  fill="var(--colour-gold)" opacity="0" class="section-glow"></rect>
```

**Step 4: Build to verify**

Run: `bun run build`
Expected: Build succeeds.

**Step 5: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "feat: rename Forge label to PROJECTS, replace hover rect with glow"
```

---

### Task 6: Update Newsletter section — subtitle + glow

**Files:**
- Modify: `src/components/CastleSceneRetro.astro:1305-1392` (Newsletter section)

**Step 1: Add subtitle "Arcane Scrolls"**

After the existing NEWSLETTER `<text>` element (line 1365-1373, `x="1096" y="512"`), add:

```html
<text x="1096" y="526" text-anchor="middle" fill="var(--colour-parchment)"
  font-family="'Press Start 2P', monospace" font-size="7" opacity="0"
  class="castle-subtitle">Arcane Scrolls</text>
```

**Step 2: Replace section-hover with section-glow**

The Newsletter scroll is at `x=1032, y=520, w=128, h=72`.
Replace the `<rect class="section-hover">` (lines 1383-1390):

```html
<!-- BEFORE -->
<rect x="1032" y="504" width="128" height="96"
  fill="var(--colour-gold)" opacity="0" class="section-hover"></rect>

<!-- AFTER -->
<rect x="1030" y="518" width="132" height="76"
  fill="var(--colour-gold)" opacity="0" class="section-glow"></rect>
```

**Step 3: Build to verify**

Run: `bun run build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "feat: add Newsletter subtitle, replace hover rect with glow"
```

---

### Task 7: Final build validation and visual check

**Step 1: Full build**

Run: `bun run build`
Expected: Zero TypeScript errors, zero Biome errors, successful Astro compilation.

**Step 2: Dev server visual check**

Run: `bun run dev`
Verify in browser:
- Labels read TALKS, BLOG, PROJECTS, SHORTS, NEWSLETTER
- Hovering shows subtitles (The Tower, The Library, etc.)
- Hover glow is a subtle gold outline, not a big rectangle
- Sections lift slightly on hover (no scale jitter)
- Moon hover still looks nice
- Sparkles still appear on hover
- `prefers-reduced-motion` disables all animations

**Step 3: Final commit if any adjustments needed**

```bash
git add src/components/CastleSceneRetro.astro
git commit -m "fix: adjust castle hover positioning after visual review"
```
