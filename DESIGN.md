# Design System - Securing the Realm

This document outlines the design system, visual language, and branding guidelines for the Securing the Realm website.

## Theme: 8-Bit Fantasy Castle

The site uses a retro 8-bit fantasy aesthetic to frame cybersecurity and technology content as an epic quest. The castle serves as the central navigation metaphor.

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Teal Background** | `#0f3c46` | Primary background, deep water/night sky |
| **Teal Dark** | `#0a2730` | Card backgrounds, depth |
| **Teal Light** | `#1a5561` | Hover states, accents |
| **Gold** | `#d5a425` | Primary accent, headings, CTA buttons |
| **Gold Light** | `#e8be4a` | Hover states, highlights |
| **Gold Dark** | `#b8901f` | Active states |

### Secondary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Stone** | `#8a877f` | Secondary text, borders |
| **Stone Light** | `#a5a29a` | Metadata, timestamps |
| **Stone Dark** | `#6f6d67` | Subtle borders |
| **Parchment** | `#f3e9d2` | Light backgrounds, body text on dark |
| **Parchment Light** | `#f9f4e7` | Hover states on light |
| **Ink** | `#1a1a1a` | Text on light backgrounds |

## Typography

### Font Stack

- **Headings**: `Press Start 2P, monospace` - Pixel-perfect 8-bit font
- **Body**: `Georgia, 'Times New Roman', serif` - Readable serif for fantasy feel
- **Monospace**: `'Courier New', monospace` - For code blocks

### Type Scale

| Size | rem | px | Usage |
|------|-----|-----|-------|
| xs | 0.75rem | 12px | Tags, metadata |
| sm | 0.875rem | 14px | Small text, captions |
| base | 1rem | 16px | Body text |
| lg | 1.125rem | 18px | Lead paragraphs |
| xl | 1.25rem | 20px | H4 |
| 2xl | 1.5rem | 24px | H3 |
| 3xl | 1.875rem | 30px | H2 |
| 4xl | 2.25rem | 36px | H1 |
| 5xl | 3rem | 48px | Hero text |

### Font Weights

- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasis
- **Semibold**: 600 - Strong emphasis
- **Bold**: 700 - Headings, buttons

## Spacing Scale

Based on 4px increments for consistent rhythm:

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

## Border Radius

- **sm**: 4px - Small elements, tags
- **md**: 6px - Inputs, small cards
- **outer**: 8px - Main cards, containers
- **lg**: 12px - Large cards
- **xl**: 16px - Prominent elements
- **full**: 9999px - Pills, badges

## Shadows

Subtle shadows for depth on dark backgrounds:

- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1)`

## Navigation Metaphor

The castle acts as the primary navigation system:

| Area | Route | Icon | Description |
|------|-------|------|-------------|
| **Castle Gate** | `/` | 🏰 | Home page, welcome |
| **Tower** | `/talks/` | 🏰 | Video talks and presentations |
| **Library** | `/blog/` | 📚 | Blog posts and articles |
| **Forge** | `/forge/` | ⚒️ | Code projects and repositories |
| **Arcane Scrolls** | https://str.riverside.com/newsletter | 📜 | Newsletter (hosted on Riverside) |
| **About** | `/about/` | 🛡️ | Mission and values |

## Pixel Art Guidelines

### Asset Requirements

All pixel art assets should:

- Be optimized to ≤ 200 KB each
- Provide 1x and 2x resolutions for retina displays
- Use the approved color palette
- Maintain consistent pixel density
- Include proper alt text for accessibility

### Planned Assets

1. **Castle facade** - Homepage hero
2. **Tower** - Talks section icon
3. **Library** - Blog section icon
4. **Forge/Anvil** - Projects section icon
5. **Scroll** - Newsletter icon
6. **Shield and Hammer** - Logo/brand mark
7. **Favicon** - 16x16, 32x32, SVG versions

## Interactive Elements

### Hover States

- **Links**: Gold → Gold Light transition (150ms)
- **Cards**: Slight elevation (translateY(-4px)) + gold glow
- **Buttons**: Background color shift + subtle scale

### Focus States

All interactive elements must have visible focus indicators:
- **Outline**: 2px solid gold
- **Offset**: 2px
- **Visible**: Always, never `outline: none`

### Animations

```css
/* Glow effect for interactive castle elements */
@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 5px var(--colour-gold)); }
  50% { filter: drop-shadow(0 0 15px var(--colour-gold-light)); }
}
```

## Accessibility

### Requirements

- **Color contrast**: Minimum WCAG AA (4.5:1 for normal text, 3:1 for large)
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Screen readers**: Semantic HTML, ARIA labels where needed
- **Skip links**: "Skip to content" link at top of page
- **Focus indicators**: Visible on all focusable elements
- **Reduced motion**: Respect `prefers-reduced-motion` media query

### Testing

- Lighthouse accessibility score ≥ 90
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, VoiceOver, or JAWS)
- Test contrast ratios with accessibility tools

## Responsive Breakpoints

Use mobile-first approach:

```css
/* Small devices (phones) */
@media (min-width: 640px) { }

/* Medium devices (tablets) */
@media (min-width: 768px) { }

/* Large devices (desktops) */
@media (min-width: 1024px) { }

/* Extra large devices */
@media (min-width: 1280px) { }
```

## Performance Targets

- **LCP (Largest Contentful Paint)**: ≤ 2.5 seconds
- **FID (First Input Delay)**: ≤ 100 milliseconds
- **CLS (Cumulative Layout Shift)**: ≤ 0.1
- **Total JavaScript**: ≤ 80 KB
- **Image optimization**: WebP/AVIF with fallbacks
- **Lazy loading**: Below-the-fold images

## Easter Eggs

Hidden elements should:
- Not interfere with navigation or accessibility
- Be discoverable through exploration
- Relate to the fantasy/gaming theme
- Example: Hidden shield icon that links to About page

## Brand Voice

- **Tone**: Adventurous, engaging, educational
- **Style**: Epic storytelling meets technical precision
- **Language**: Fantasy metaphors for tech concepts
- **Audience**: Tech professionals who appreciate creativity

## File Organization

```
src/
├── styles/
│   ├── tokens.css      # Design tokens (this system)
│   └── global.css      # Global styles
├── assets/
│   └── pixel/          # Pixel art assets
└── components/         # Reusable components
```

## Version

Design System v1.0 - January 2025
