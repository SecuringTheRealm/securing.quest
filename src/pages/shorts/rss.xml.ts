import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { fetchYouTubeShorts } from '../../utils/youtube';

export async function GET(context: APIContext) {
	const shorts = await fetchYouTubeShorts();

	const items = shorts.map((short) => ({
		title: short.title,
		description: short.description || 'A short from the Securing the Realm YouTube channel.',
		pubDate: short.pubDate,
		link: short.videoUrl,
		categories: short.tags,
	}));

	return rss({
		title: 'Securing the Realm - Shorts',
		description:
			'Quick glimpses into the realm - bite-sized adventures in security, AI, and beyond.',
		site: context.site || 'https://securing.quest',
		items,
		customData: `<language>en-us</language>`,
	});
}
