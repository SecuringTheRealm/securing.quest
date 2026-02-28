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

export interface YouTubeShort {
	id: string;
	title: string;
	description: string;
	pubDate: Date;
	thumbnailUrl: string;
	videoUrl: string;
	embedUrl: string;
	tags: string[];
	relatedContent: RelatedContentLink[];
}

export interface RelatedContentLink {
	type: 'blog' | 'talk' | 'project' | 'external';
	url: string;
	title: string;
}

interface YouTubeEntry {
	id: string;
	'yt:videoId'?: string;
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

const YOUTUBE_SHORTS_PLAYLIST_ID = 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g';
const YOUTUBE_SHORTS_FEED_URL = `https://www.youtube.com/feeds/videos.xml?playlist_id=${YOUTUBE_SHORTS_PLAYLIST_ID}`;

// Module-level cache to avoid redundant fetches during a single build.
// Multiple pages call fetchYouTubeTalks() (directly and via buildSearchIndex),
// so caching saves N-1 HTTP requests to YouTube during static generation.
let _cachedTalks: YouTubeTalk[] | null = null;
let _cachedShorts: YouTubeShort[] | null = null;

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
 * Extracts securing.quest URLs from a description and classifies them
 */
function extractRelatedContent(description: string): RelatedContentLink[] {
	const urlRegex = /https?:\/\/securing\.quest\/(blog|talks|forge)(\/[^\s)]*)?/g;
	const matches = description.matchAll(urlRegex);
	const typeMap: Record<string, RelatedContentLink['type']> = {
		blog: 'blog',
		talks: 'talk',
		forge: 'project',
	};

	return Array.from(matches, (match: RegExpExecArray) => ({
		type: typeMap[match[1]] || 'external',
		url: match[0],
		title: `Related ${match[1]} content`,
	}));
}

/**
 * Fetches YouTube Shorts from the Shorts playlist feed at build time.
 * Results are cached in memory for the duration of the build process.
 * @returns Array of YouTube Shorts
 */
export async function fetchYouTubeShorts(): Promise<YouTubeShort[]> {
	if (_cachedShorts !== null) {
		return _cachedShorts;
	}

	try {
		const response = await fetch(YOUTUBE_SHORTS_FEED_URL);
		if (!response.ok) {
			console.warn(`Failed to fetch YouTube Shorts feed: ${response.statusText}`);
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
			console.warn('No entries found in YouTube Shorts feed');
			return [];
		}

		const entries = parsedXml.feed.entry as YouTubeEntry[];

		const shorts = entries.map((entry: YouTubeEntry) => {
			const videoUrl = entry.link['@_href'] || '';
			const publishedDate = new Date(entry.published);

			// Extract video ID from URL
			// Shorts use /shorts/VIDEO_ID, regular videos use ?v=VIDEO_ID
			let videoId = '';
			try {
				const urlObj = new URL(videoUrl);
				videoId = urlObj.searchParams.get('v') || '';
				if (!videoId) {
					const shortsMatch = urlObj.pathname.match(/\/shorts\/([^/]+)/);
					if (shortsMatch) {
						videoId = shortsMatch[1];
					}
				}
			} catch {
				// fallback: extract from yt:video:VIDEO_ID format
				const ytMatch = (entry.id || '').match(/yt:video:(.+)/);
				videoId = ytMatch ? ytMatch[1] : entry.id || '';
			}

			// Extract description
			let description = '';
			if (entry['media:group']?.['media:description']) {
				description = entry['media:group']['media:description'];
			}

			// Extract hashtags from description
			const hashtagRegex = /#[\w-]+/g;
			const hashtags = description.match(hashtagRegex) || [];
			const extractedTags = hashtags.map((tag) => {
				return tag
					.substring(1)
					.replace(/-/g, ' ')
					.split(' ')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
					.join(' ');
			});

			// Default tags for Shorts
			const defaultTags = ['YouTube', 'Shorts', 'Security'];

			// Combine and deduplicate tags
			const allTags = [...new Set([...defaultTags, ...extractedTags])];

			// Extract related content from description
			const relatedContent = extractRelatedContent(description);

			// Generate thumbnail URL
			const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';

			// Generate embed URL
			const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';

			return {
				id: videoId,
				title: entry.title,
				description,
				pubDate: publishedDate,
				thumbnailUrl,
				videoUrl,
				embedUrl,
				tags: allTags,
				relatedContent,
			};
		});

		_cachedShorts = shorts;
		return shorts;
	} catch (error) {
		console.error('Error fetching YouTube Shorts:', error);
		_cachedShorts = [];
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
