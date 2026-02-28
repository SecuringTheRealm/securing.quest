# YouTube Shorts Indexing - Design

**Date:** 2026-02-28
**Status:** Approved

## Goal

Surface YouTube Shorts on securing.quest as a distinct content type for content completeness. The site should be the single source of truth for all Securing the Realm output.

## Data Layer

### YouTube RSS Feed

- Shorts playlist ID: `PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g`
- Extend `src/utils/youtube.ts` with `fetchYouTubeShorts()` using the same RSS parsing pattern as `fetchYouTubeTalks()`
- Returns `YouTubeShort` type: `id`, `title`, `description`, `pubDate`, `thumbnailUrl`, `videoUrl`, `tags[]`
- Auto-parse URLs from description for cross-links (matching `securing.quest/*` patterns)
- Default tags: `['YouTube', 'Shorts', 'Security']` plus hashtag extraction

### Manual Override Collection

- New `shorts` content collection in `src/content/shorts/` (type: `data`, JSON files)
- Schema: `youtubeId`, `relatedContent?: { type, slug }[]`, `tags?`, `title?`
- File naming: `{youtube-video-id}.json`
- At build time, RSS data is the base, manual overrides supplement/replace specific fields

### Unified Type

```typescript
interface UnifiedShort {
  id: string;
  title: string;
  description: string;
  pubDate: Date;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl: string;
  tags: string[];
  relatedContent: { type: string; slug: string; title: string; url: string }[];
}
```

## Pages & UI

### Dedicated Shorts Page (`/shorts/`)

- Grid layout with vertical 9:16 aspect ratio thumbnails
- Each card: thumbnail, title, date, tags, related content links
- Click-to-play or link to YouTube
- Sorted by pubDate descending

### Homepage Feed

- Shorts appear in "Latest Adventures" unified feed with a distinct "Short" badge
- Links to `/shorts/` or directly to YouTube

### Castle Scene - Moon Nav

- Wrap existing moon SVG in `<a href="/shorts/">`
- `aria-label="Shorts - Watch quick videos"`, `data-castle-nav="Shorts"`
- Hover label in Press Start 2P
- Plausible tracking via existing `data-castle-nav` script

### Header Nav

- Add "Shorts" entry, castle name "Moon"

### RSS Feed

- `/shorts/rss.xml` (same pattern as blog RSS)

### Search

- Shorts indexed in `src/utils/search.ts`

## Build & CI

- `fetchYouTubeShorts()` runs at build time, in-memory cache
- GitHub Actions: diff Shorts playlist XML alongside talks for rebuild triggers
- Cache file: `.cache/xml-shorts-feed.xml`
- No new dependencies (reuses `fast-xml-parser`)

## Files Affected

- `src/utils/youtube.ts` - add Shorts fetching and types
- `src/content/config.ts` - add shorts collection
- `src/pages/shorts/index.astro` - new page
- `src/pages/shorts/rss.xml.ts` - new RSS feed
- `src/components/CastleSceneRetro.astro` - moon as nav link
- `src/layouts/Base.astro` - header nav entry
- `src/pages/index.astro` - homepage feed integration
- `src/utils/search.ts` - search index
- `.github/workflows/publish.yml` - CI rebuild trigger
