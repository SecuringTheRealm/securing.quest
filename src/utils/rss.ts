export function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export interface RssFeed {
	title: string;
	description: string;
	siteUrl: string;
	/** Path of this feed, e.g. '/blog/rss.xml' */
	selfPath: string;
	/** Pre-rendered <item> blocks */
	items: string[];
}

export function renderRss({ title, description, siteUrl, selfPath, items }: RssFeed): Response {
	const rss = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
		'<channel>',
		`  <title>${escapeXml(title)}</title>`,
		`  <description>${escapeXml(description)}</description>`,
		`  <link>${escapeXml(siteUrl)}</link>`,
		`  <atom:link href="${escapeXml(`${siteUrl}${selfPath}`)}" rel="self" type="application/rss+xml" />`,
		'  <language>en-us</language>',
		items.join('\n'),
		'</channel>',
		'</rss>',
	].join('\n');

	return new Response(rss, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
}
