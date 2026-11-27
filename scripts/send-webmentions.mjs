/**
 * Send webmentions for outgoing links in the built site.
 *
 * Scans dist/ HTML files for outgoing <a> links, discovers webmention
 * endpoints on target sites, and sends webmentions.
 *
 * Usage: bun scripts/send-webmentions.mjs
 *
 * Expects the site to be built first (bun run build).
 */

import { createHash } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { readdir, readFile } from 'node:fs/promises';
import { isIP } from 'node:net';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, writeJson } from './lib/json-store.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const TRACKING_FILE = join(__dirname, '..', 'src', 'data', 'sent-webmentions.json');
const SITE_URL = 'https://securing.quest';

export function isPrivateAddress(address) {
	if (isIP(address) === 4) {
		const octets = address.split('.').map(Number);
		return (
			octets[0] === 10 ||
			octets[0] === 127 ||
			octets[0] === 0 ||
			(octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127) ||
			(octets[0] === 169 && octets[1] === 254) ||
			(octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
			(octets[0] === 192 && octets[1] === 168) ||
			octets[0] >= 224
		);
	}

	const normalized = address.toLowerCase();
	return (
		normalized === '::1' ||
		normalized === '::' ||
		normalized.startsWith('fc') ||
		normalized.startsWith('fd') ||
		normalized.startsWith('fe8') ||
		normalized.startsWith('fe9') ||
		normalized.startsWith('fea') ||
		normalized.startsWith('feb') ||
		normalized.startsWith('::ffff:')
	);
}

export function isSafeRemoteUrl(url) {
	if (url.protocol !== 'https:') return false;
	const host = url.hostname.toLowerCase();
	if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return false;
	if (isIP(host) && isPrivateAddress(host)) return false;
	return true;
}

async function assertPublicDestination(url) {
	if (!isSafeRemoteUrl(url)) {
		throw new Error('Unsafe webmention URL');
	}
	if (isIP(url.hostname)) return;

	const addresses = await lookup(url.hostname, { all: true, verbatim: true });
	if (addresses.length === 0 || addresses.some(({ address }) => isPrivateAddress(address))) {
		throw new Error('Unsafe webmention destination');
	}
}

async function findHtmlFiles(dir) {
	const entries = await readdir(dir, { recursive: true });
	return entries.filter((entry) => entry.endsWith('.html')).map((entry) => join(dir, entry));
}

function extractLinks(html) {
	const links = new Set();
	const regex = /<a[^>]+href="([^"]+)"[^>]*>/gi;
	for (const match of html.matchAll(regex)) {
		const href = match[1];
		if (href.startsWith('http://') || href.startsWith('https://')) {
			if (!href.startsWith(SITE_URL)) {
				links.add(href);
			}
		}
	}
	return [...links];
}

async function discoverEndpoint(targetUrl) {
	try {
		let currentUrl = new URL(targetUrl);
		await assertPublicDestination(currentUrl);
		let res;

		for (let redirects = 0; redirects <= 5; redirects++) {
			const controller = new AbortController();
			const timeout = setTimeout(() => controller.abort(), 10000);
			res = await fetch(currentUrl, {
				signal: controller.signal,
				redirect: 'manual',
				headers: { Accept: 'text/html' },
			});
			clearTimeout(timeout);

			if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
				currentUrl = new URL(res.headers.get('location'), currentUrl);
				await assertPublicDestination(currentUrl);
				continue;
			}
			break;
		}

		if (!res || !res.ok) return null;

		const linkHeader = res.headers.get('link');
		if (linkHeader) {
			const wmMatch = linkHeader.match(/<([^>]+)>;\s*rel="?webmention"?/);
			if (wmMatch) {
				const endpoint = new URL(wmMatch[1], currentUrl);
				await assertPublicDestination(endpoint);
				return endpoint.href;
			}
		}

		const html = await res.text();
		const htmlMatch =
			html.match(/<link[^>]+rel="?webmention"?[^>]+href="([^"]+)"/) ||
			html.match(/<link[^>]+href="([^"]+)"[^>]+rel="?webmention"?/);
		if (htmlMatch) {
			const endpoint = new URL(htmlMatch[1], currentUrl);
			await assertPublicDestination(endpoint);
			return endpoint.href;
		}

		return null;
	} catch {
		return null;
	}
}

async function sendWebmention(endpoint, source, target) {
	try {
		const endpointUrl = new URL(endpoint);
		await assertPublicDestination(endpointUrl);
		const body = new URLSearchParams({ source, target }).toString();
		let currentUrl = endpointUrl;
		let res;

		for (let redirects = 0; redirects <= 5; redirects++) {
			res = await fetch(currentUrl, {
				method: 'POST',
				redirect: 'manual',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
			});

			if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
				currentUrl = new URL(res.headers.get('location'), currentUrl);
				await assertPublicDestination(currentUrl);
				continue;
			}
			break;
		}

		return { ok: res.ok, status: res.status };
	} catch (err) {
		return { ok: false, status: 0, error: err.message };
	}
}

async function main() {
	console.log('Scanning built site for outgoing links...');

	let htmlFiles;
	try {
		htmlFiles = await findHtmlFiles(DIST_DIR);
	} catch {
		console.log('dist/ directory not found. Run bun run build first.');
		process.exit(1);
	}

	console.log(`Found ${htmlFiles.length} HTML files.`);

	const tracking = await readJson(TRACKING_FILE);
	let sent = 0;
	let skipped = 0;
	let unchanged = 0;
	let noHentry = 0;
	let noEndpoint = 0;

	for (const file of htmlFiles) {
		const html = await readFile(file, 'utf-8');
		const links = extractLinks(html);
		if (links.length === 0) continue;

		// Only send webmentions from pages with h-entry microformats
		if (!html.includes('class="h-entry"')) {
			noHentry += links.length;
			continue;
		}

		const relPath = relative(DIST_DIR, file);
		const sourceUrl = `${SITE_URL}/${relPath.replace(/index\.html$/, '')}`;
		const contentHash = createHash('sha256').update(html).digest('hex').slice(0, 16);

		for (const targetUrl of links) {
			const key = `${sourceUrl} -> ${targetUrl}`;
			const entry = tracking[key];

			if (entry === 'no-endpoint') {
				skipped++;
				continue;
			}

			// Skip if already sent and source page content hasn't changed
			if (entry && typeof entry === 'object' && entry.contentHash === contentHash) {
				unchanged++;
				continue;
			}

			// Migrate old string format or discover new endpoint
			let endpoint = entry && typeof entry === 'object' ? entry.endpoint : entry;
			if (!endpoint) {
				endpoint = await discoverEndpoint(targetUrl);
				if (!endpoint) {
					tracking[key] = 'no-endpoint';
					noEndpoint++;
					continue;
				}
			}

			const result = await sendWebmention(endpoint, sourceUrl, targetUrl);
			if (result.ok) {
				tracking[key] = { endpoint, contentHash };
				console.log(`  Sent: ${sourceUrl} -> ${targetUrl}`);
				sent++;
			} else {
				console.log(`  Failed (${result.status}): ${sourceUrl} -> ${targetUrl}`);
			}
		}
	}

	await writeJson(TRACKING_FILE, tracking);
	console.log(
		`\nDone. Sent: ${sent}, Skipped (no endpoint): ${skipped}, Unchanged: ${unchanged}, No h-entry: ${noHentry}, No endpoint: ${noEndpoint}`
	);
}

if (import.meta.main) {
	main().catch((err) => {
		console.error('Send webmentions failed:', err);
		process.exit(1);
	});
}
