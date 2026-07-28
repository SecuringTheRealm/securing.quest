import type { APIContext } from 'astro';
import { escapeXml, renderRss } from '../../utils/rss';
import { fetchYouTubeShorts } from '../../utils/youtube';

export async function GET(context: APIContext): Promise<Response> {
	const shorts = await fetchYouTubeShorts();

	const siteUrl = (context.site || new URL('https://securing.quest')).toString().replace(/\/$/, '');

	const items = shorts.map((short) => {
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

	return renderRss({
		title: 'Securing the Realm - Shorts',
		description:
			'Quick glimpses into the realm - bite-sized adventures in security, AI, and beyond.',
		siteUrl,
		selfPath: '/shorts/rss.xml',
		items,
	});
}
