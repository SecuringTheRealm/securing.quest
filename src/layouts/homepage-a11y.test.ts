import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const read = (path: string): string =>
	readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('homepage accessibility fixes', () => {
	test('base navigation is progressively enhanced with ARIA and close behaviour', () => {
		const base = read('src/layouts/Base.astro');
		const globalCss = read('src/styles/global.css');

		expect(base).toContain("document.documentElement.classList.add('js')");
		expect(base).toContain('aria-controls="primary-navigation"');
		expect(base).toContain('id="primary-navigation"');
		expect(base).toContain('closeMenu();');
		expect(base).toContain('mobileMenuToggle?.focus();');
		expect(base).toContain("if (e.key === 'Escape'");
		expect(base).toContain("navMenu?.classList.toggle('is-open', !isExpanded)");
		expect(base).toContain("&& navMenu?.classList.contains('is-open')");
		expect(base).toContain('const outsideMenu = navMenu && !navMenu.contains(target)');
		expect(base).toContain(
			'const outsideToggle = mobileMenuToggle && !mobileMenuToggle.contains(target)'
		);
		expect(base).toMatch(
			/if \(navMenu\?\.classList\.contains\('is-open'\) && outsideMenu && outsideToggle\)/
		);
		expect(globalCss).toContain('html:not(.js) .mobile-menu-toggle');
		expect(globalCss).toContain('html.js .nav-menu.is-open');
		expect(globalCss).toMatch(/html\.js \.nav-menu\.is-open\s*\{[^}]*opacity:\s*1;/);
		expect(globalCss).toMatch(/html\.js \.nav-menu\.is-open\s*\{[^}]*visibility:\s*visible;/);
		expect(globalCss).toMatch(/html\.js \.nav-menu\.is-open\s*\{[^}]*transform:\s*translateY\(0\)/);
	});

	test('homepage has valid block content and a section heading', () => {
		const index = read('src/pages/index.astro');

		expect(index).not.toContain('<span class="quest-row__body">');
		expect(index).toContain('<div class="quest-row__body">');
		expect(index).toContain('<h2 class="lead-story__title">');
		expect(index).not.toContain('<h3 class="lead-story__title">');
	});

	test('video replacement moves keyboard focus to the iframe', () => {
		const videoFacade = read('src/components/VideoFacade.astro');

		expect(videoFacade).toContain("iframe.setAttribute('tabindex', '0')");
		expect(videoFacade).toContain('iframe.focus();');
	});
});
