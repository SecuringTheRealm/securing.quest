import type { CollectionEntry } from 'astro:content';
import { getCollection, render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

const SITE_TITLE = 'Securing the Realm - Blog';
const SITE_DESCRIPTION =
	'Epic adventures in cybersecurity, Azure, and AI through the lens of fantasy storytelling.';

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getCollection('blog', ({ data }: CollectionEntry<'blog'>) => {
		return data.draft !== true;
	});

	const sortedPosts = blog.sort(
		(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
			b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	const container = await AstroContainer.create();
	container.addServerRenderer({ renderer: mdxRenderer, name: '@astrojs/mdx' });

	const siteUrl = (context.site || new URL('https://securing.quest')).toString().replace(/\/$/, '');

	const itemsXml = await Promise.all(
		sortedPosts.map(async (post: CollectionEntry<'blog'>) => {
			const { Content } = await render(post);
			const content = await container.renderToString(Content);
			const link = `${siteUrl}/blog/${post.id}/`;
			const categories = post.data.tags
				.map((tag: string) => `    <category>${escapeXml(tag)}</category>`)
				.join('\n');

			return [
				'  <item>',
				`    <title>${escapeXml(post.data.title)}</title>`,
				`    <description>${escapeXml(post.data.description)}</description>`,
				`    <pubDate>${post.data.pubDate.toUTCString()}</pubDate>`,
				`    <link>${escapeXml(link)}</link>`,
				`    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
				categories,
				`    <content:encoded><![CDATA[${content}]]></content:encoded>`,
				'  </item>',
			]
				.filter(Boolean)
				.join('\n');
		})
	);

	const rss = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
		'<channel>',
		`  <title>${escapeXml(SITE_TITLE)}</title>`,
		`  <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
		`  <link>${escapeXml(siteUrl)}</link>`,
		`  <atom:link href="${escapeXml(`${siteUrl}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />`,
		'  <language>en-us</language>',
		itemsXml.join('\n'),
		'</channel>',
		'</rss>',
	].join('\n');

	return new Response(rss, {
		headers: { 'Content-Type': 'application/xml; charset=utf-8' },
	});
}
