import type { CollectionEntry } from 'astro:content';
import { getCollection, render } from 'astro:content';
import mdxRenderer from '@astrojs/mdx/server.js';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { escapeXml, renderRss } from '../../utils/rss';

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

	const items = await Promise.all(
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

	return renderRss({
		title: 'Securing the Realm - Blog',
		description:
			'Epic adventures in cybersecurity, Azure, and AI through the lens of fantasy storytelling.',
		siteUrl,
		selfPath: '/blog/rss.xml',
		items,
	});
}
