# MVP URL Rotation Rehype Plugin

**Date:** 2026-02-28
**Status:** Approved

## Problem

Microsoft URLs on securing.quest need MVP tracking params (`WT.mc_id`) rotated equitably between two MVPs (Chris and Josh) at build time, with zero runtime cost.

## Tracking IDs

- Chris: `AI-MVP-5004204`
- Josh: `MVP_466754`

## Approach

A rehype plugin (`src/plugins/rehype-mvp-url.ts`) that runs in the Astro MDX pipeline at build time.

### Behaviour

1. Walks the rehype HTML AST for `<a>` elements with `href` matching `*.microsoft.com`
2. Parses the URL, strips any existing `WT.mc_id` or `wt.mc_id` param (case-insensitive)
3. Hashes the URL pathname to deterministically pick one of the two IDs
4. Sets `WT.mc_id` param, preserving all other query params
5. Reconstructs the URL

### Hash Function

Simple string hash of the pathname → mod 2 → index into ID array. Deterministic per unique URL path, roughly 50/50 across many distinct paths.

### Test Cases

- Bare Microsoft URL → adds `?WT.mc_id=<id>`
- URL with existing `?WT.mc_id=AI-MVP-5004204` → replaces with hashed choice
- URL with `?wt.mc_id=...` (case-insensitive match) → replaces
- URL with other params (`?tab=foo`) → preserves them, adds `WT.mc_id`
- URL with both `?tab=foo&WT.mc_id=old` → preserves `tab`, replaces `WT.mc_id`
- Non-Microsoft URL → untouched
- Same URL path → always same ID (deterministic)
- Distribution across many paths → roughly 50/50

### Registration

Add to `astro.config.mjs` in the MDX integration's `rehypePlugins` array.

## Files

- `src/plugins/rehype-mvp-url.ts` — the plugin
- `src/plugins/rehype-mvp-url.test.ts` — tests
- `astro.config.mjs` — register the plugin
