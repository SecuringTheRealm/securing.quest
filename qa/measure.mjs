// Seam audit + screenshots. Run: bunx --bun playwright ... no — plain node/bun:
//   bun qa/measure.mjs <url> <label>
// Writes qa/screenshots/<label>-{1440,390}.png and prints the seam table.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4321/';
const label = process.argv[3] ?? 'shot';
const debugOutline = process.argv.includes('--outline');

// Each block is a background region; the seam between two is where the colour
// can change, so the boundary is always the shared edge of adjacent siblings.
const COLLECT = `(() => {
  const blocks = [];
  const push = (el, name) => { if (el) blocks.push([el, name]); };
  push(document.querySelector('header'), 'header');
  const shell = document.querySelector('.page-shell');
  const names = ['hero', 'map', 'quest', 'listen', 'arcane', 'party'];
  [...shell.children].forEach((el, i) => push(el, names[i] ?? 'block' + i));
  push(document.querySelector('footer'), 'footer');

  // Extremes of painted content, so margins and wrapper padding are counted as gap.
  const extremes = (root) => {
    // Visually-hidden wrappers still lay their children out at full size, so a
    // screen-reader-only list reports a rect hundreds of pixels past the section.
    // Collect the clipped wrappers first and skip everything inside them.
    const clipped = [...root.querySelectorAll('*')].filter((el) => {
      const s = getComputedStyle(el);
      return s.clip === 'rect(0px, 0px, 0px, 0px)' || s.clipPath === 'inset(50%)';
    });
    let top = Infinity, bottom = -Infinity;
    for (const el of root.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.opacity === '0') continue;
      if (clipped.some((c) => c.contains(el))) continue;
      top = Math.min(top, r.top); bottom = Math.max(bottom, r.bottom);
    }
    return { top, bottom };
  };

  return blocks.map(([el, name]) => {
    const r = el.getBoundingClientRect();
    const e = extremes(el);
    return {
      name,
      top: Math.round(r.top + scrollY),
      bottom: Math.round(r.bottom + scrollY),
      contentTop: Math.round(e.top + scrollY),
      contentBottom: Math.round(e.bottom + scrollY),
      bg: getComputedStyle(el).backgroundColor,
    };
  });
})()`;

// System Chrome, so this needs no bundled-browser download.
const browser = await chromium.launch({ channel: 'chrome' });
const rows = [];

for (const [w, h] of [
  [1440, 900],
  [390, 844],
]) {
  const page = await browser.newPage({ viewportSize: { width: w, height: h } });
  await page.goto(url, { waitUntil: 'networkidle' });
  if (debugOutline) {
    await page.addStyleTag({ content: '* { outline: 1px solid rgba(255,0,0,.4) !important; }' });
  }
  await page.screenshot({ path: `qa/screenshots/${label}-${w}.png`, fullPage: true });
  if (w === 1440) rows.push(...(await page.evaluate(COLLECT)));
  await page.close();
}

await browser.close();

// The colour edge between two blocks is the top of the lower one: adjacent
// siblings share it, and where a wrapper sits between them (header/main) the
// lower block's own top is still where its background starts.
console.log(`\n${label} @1440 — seam bisection (target 96 / 96)\n`);
console.log('seam                       above  below  total  bisected');
for (let i = 0; i < rows.length - 1; i++) {
  const a = rows[i];
  const b = rows[i + 1];
  const edge = b.top;
  const above = edge - a.contentBottom;
  const below = b.contentTop - edge;
  const ok = above === 96 && below === 96;
  console.log(
    `${`${a.name} -> ${b.name}`.padEnd(26)} ${String(above).padStart(5)}  ${String(below).padStart(5)}  ${String(above + below).padStart(5)}  ${ok ? 'yes' : 'NO'}`,
  );
}

// Content escaping its own block means a child margin or overflow is driving the
// seam, not the section padding — the seam numbers above cannot be trusted until
// it is gone.
const overflow = rows.filter((r) => r.contentBottom > r.bottom || r.contentTop < r.top);
if (overflow.length) {
  console.log('\noverflowing blocks (content outside the block box):');
  for (const r of overflow) {
    console.log(
      `  ${r.name.padEnd(10)} box ${r.top}..${r.bottom}   content ${r.contentTop}..${r.contentBottom}`,
    );
  }
}
