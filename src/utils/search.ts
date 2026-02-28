import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { fetchYouTubeShorts, fetchYouTubeTalks } from './youtube';

export interface SearchItem {
	type: 'blog' | 'talk' | 'project' | 'short';
	title: string;
	description: string;
	url: string;
	date?: Date;
	tags: string[];
}

/**
 * Build search index from all content collections
 * Aggregates blog posts, talks (manual + YouTube), and projects into searchable items
 */
export async function buildSearchIndex(): Promise<SearchItem[]> {
	const items: SearchItem[] = [];

	// Add blog posts
	const blogPosts = await getCollection('blog', ({ data }: CollectionEntry<'blog'>) => {
		return data.draft !== true;
	});

	blogPosts.forEach((post: CollectionEntry<'blog'>) => {
		items.push({
			type: 'blog',
			title: post.data.title,
			description: post.data.description,
			url: `/blog/${post.slug}/`,
			date: post.data.pubDate,
			tags: post.data.tags,
		});
	});

	// Add manual talks from content collection
	const manualTalks = await getCollection('talks');
	manualTalks.forEach((talk: CollectionEntry<'talks'>) => {
		items.push({
			type: 'talk',
			title: talk.data.title,
			description: `${talk.data.event}: ${talk.data.summary}`,
			url: `/talks/#${talk.id}`,
			date: talk.data.date,
			tags: talk.data.tags,
		});
	});

	// Add YouTube talks dynamically
	const youtubeTalks = await fetchYouTubeTalks();
	youtubeTalks.forEach((talk, index) => {
		items.push({
			type: 'talk',
			title: talk.title,
			description: `${talk.event}: ${talk.summary}`,
			url: `/talks/#youtube-${index}`,
			date: talk.date,
			tags: talk.tags,
		});
	});

	// Add YouTube Shorts
	const youtubeShorts = await fetchYouTubeShorts();
	youtubeShorts.forEach((short) => {
		items.push({
			type: 'short',
			title: short.title,
			description: short.description || 'A short from the Securing the Realm YouTube channel.',
			url: short.videoUrl,
			date: short.pubDate,
			tags: short.tags,
		});
	});

	// Add projects
	const projects = await getCollection('projects');
	projects.forEach((project: CollectionEntry<'projects'>) => {
		items.push({
			type: 'project',
			title: project.data.name,
			description: project.data.description,
			url: `/forge/#${project.id}`,
			tags: project.data.tech,
		});
	});

	return items;
}

/**
 * Get fuse.js configuration for search
 */
export function getFuseOptions() {
	return {
		keys: [
			{ name: 'title', weight: 3 },
			{ name: 'description', weight: 2 },
			{ name: 'tags', weight: 1 },
		],
		threshold: 0.4,
		includeScore: true,
		minMatchCharLength: 2,
		ignoreLocation: true,
	};
}
