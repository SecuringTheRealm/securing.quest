import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import mdxRenderer from '@astrojs/mdx/server.js';

export async function GET(context: APIContext) {
	const blog = await getCollection('blog', ({ data }: CollectionEntry<'blog'>) => {
		return data.draft !== true;
	});

	const sortedPosts = blog.sort(
		(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
			b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
	);

	const container = await AstroContainer.create();
	container.addServerRenderer({ renderer: mdxRenderer, name: '@astrojs/mdx' });

	const items = await Promise.all(
		sortedPosts.map(async (post: CollectionEntry<'blog'>) => {
			const { Content } = await post.render();
			const content = await container.renderToString(Content);

			return {
				title: post.data.title,
				description: post.data.description,
				pubDate: post.data.pubDate,
				link: `/blog/${post.slug}/`,
				categories: post.data.tags,
				content,
			};
		})
	);

	return rss({
		title: 'Securing the Realm - Blog',
		description:
			'Epic adventures in cybersecurity, Azure, and AI through the lens of fantasy storytelling.',
		site: context.site || 'https://securing.quest',
		items,
		customData: `<language>en-us</language>`,
	});
}
