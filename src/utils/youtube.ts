/**
 * YouTube utility functions
 */

import { XMLParser } from 'fast-xml-parser';

export interface YouTubeTalk {
	title: string;
	date: Date;
	event: string;
	videoUrl: string;
	summary: string;
	tags: string[];
}

interface YouTubeEntry {
	id: string;
	title: string;
	published: string;
	link: {
		'@_href': string;
	};
	'media:group'?: {
		'media:description'?: string;
	};
}

const YOUTUBE_PLAYLIST_ID = 'PLo9Ah7HeyG1QVWTBPzOROBQNqinh0ZPWv';
const YOUTUBE_FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_PLAYLIST_ID}`;

// Module-level cache to avoid redundant fetches during a single build.
// Multiple pages call fetchYouTubeTalks() (directly and via buildSearchIndex),
// so caching saves N-1 HTTP requests to YouTube during static generation.
let _cachedTalks: YouTubeTalk[] | null = null;

/**
 * Fetches YouTube talks from the channel feed dynamically at build time.
 * Results are cached in memory for the duration of the build process.
 * @returns Array of YouTube talks
 */
export async function fetchYouTubeTalks(): Promise<YouTubeTalk[]> {
	if (_cachedTalks !== null) {
		return _cachedTalks;
	}

	try {
		const response = await fetch(YOUTUBE_FEED_URL);
		if (!response.ok) {
			console.warn(`Failed to fetch YouTube feed: ${response.statusText}`);
			return [];
		}

		const xmlData = await response.text();

		const parser = new XMLParser({
			ignoreAttributes: false,
			attributeNamePrefix: '@_',
			isArray: (name: string) => ['entry'].includes(name),
			processEntities: true,
			parseAttributeValue: true,
		});

		const parsedXml = parser.parse(xmlData);

		if (!parsedXml.feed || !parsedXml.feed.entry) {
			console.warn('No entries found in YouTube feed');
			return [];
		}

		const entries = parsedXml.feed.entry as YouTubeEntry[];

		const talks = entries.map((entry: YouTubeEntry) => {
			const videoUrl = entry.link['@_href'] || '';
			const publishedDate = new Date(entry.published);

			// Extract description
			let description = '';
			if (entry['media:group']?.['media:description']) {
				description = entry['media:group']['media:description'];
			}

			// Extract hashtags from description
			const hashtagRegex = /#[\w-]+/g;
			const hashtags = description.match(hashtagRegex) || [];
			const extractedTags = hashtags.map((tag) => {
				// Remove # and replace hyphens with spaces
				return tag
					.substring(1)
					.replace(/-/g, ' ')
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
					.join(' ');
			});

			// Default tags for all YouTube talks
			const defaultTags = ['AI', 'GenAI', 'Agentic Systems', 'Security', 'YouTube', 'Video'];

			// Combine and deduplicate tags
			const allTags = [...new Set([...defaultTags, ...extractedTags])];

			// Truncate description to a reasonable length for summary
			const summary =
				description.length > 200 ? `${description.substring(0, 197)}...` : description;

			return {
				title: entry.title,
				date: publishedDate,
				event: 'YouTube - Securing the Realm',
				videoUrl,
				summary: summary || 'A video from the Securing the Realm YouTube channel.',
				tags: allTags,
			};
		});

		_cachedTalks = talks;
		return talks;
	} catch (error) {
		console.error('Error fetching YouTube talks:', error);
		_cachedTalks = [];
		return [];
	}
}

/**
 * Extracts YouTube video ID from a URL and returns the embed URL
 * @param url - YouTube video URL (e.g., https://youtube.com/watch?v=...)
 * @returns Embed URL (e.g., https://www.youtube-nocookie.com/embed/...) or null if invalid
 */
export function getYouTubeEmbedUrl(url: string | undefined): string | null {
	if (!url) return null;

	try {
		const urlObj = new URL(url);

		// Handle youtu.be short links
		if (urlObj.hostname === 'youtu.be') {
			const videoId = urlObj.pathname.slice(1);
			return `https://www.youtube-nocookie.com/embed/${videoId}`;
		}

		// Handle youtube.com URLs
		if (urlObj.hostname.includes('youtube.com')) {
			const videoId = urlObj.searchParams.get('v');
			if (videoId) {
				return `https://www.youtube-nocookie.com/embed/${videoId}`;
			}
		}

		return null;
	} catch {
		return null;
	}
}
