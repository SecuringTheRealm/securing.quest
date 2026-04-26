import type { APIContext } from 'astro';
import { fetchYouTubeShorts } from '../../utils/youtube';

const SITE_TITLE = 'Securing the Realm - Shorts';
const SITE_DESCRIPTION =
	'Quick glimpses into the realm - bite-sized adventures in security, AI, and beyond.';

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function GET(context: APIContext): Promise<Response> {
	const shorts = await fetchYouTubeShorts();

	const siteUrl = (context.site || new URL('https://securing.quest')).toString().replace(/\/$/, '');

	const itemsXml = shorts.map((short) => {
		const description = short.description || 'A short from the Securing the Realm YouTube channel.';
		const categories = short.tags
			.map((tag: string) => `    <category>${escapeXml(tag)}</category>`)
			.join('\n');
		return [
			'  <item>',
			`    <title>${escapeXml(short.title)}</title>`,
			`    <description>${escapeXml(description)}</description>`,
			`    <pubDate>${short.pubDate.toUTCString()}</pubDate>`,
			`    <link>${escapeXml(short.videoUrl)}</link>`,
			`    <guid isPermaLink="true">${escapeXml(short.videoUrl)}</guid>`,
			categories,
			'  </item>',
		]
			.filter(Boolean)
			.join('\n');
	});

	const rss = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'<channel>',
		`  <title>${escapeXml(SITE_TITLE)}</title>`,
		`  <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
		`  <link>${escapeXml(siteUrl)}</link>`,
		`  <atom:link href="${escapeXml(`${siteUrl}/shorts/rss.xml`)}" rel="self" type="application/rss+xml" />`,
		'  <language>en-us</language>',
		itemsXml.join('\n'),
		'</channel>',
		'</rss>',
	].join('\n');

	return new Response(rss, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
}
