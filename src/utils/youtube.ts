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

const YOUTUBE_CHANNEL_ID = 'UCS4KTDaZTiyiMj2yZztwmlg';
const YOUTUBE_CHANNEL_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

// YouTube rate-limits bursts of feed requests with a 404, so retry once before
// giving up. Failing loudly beats deploying an empty Talks and Shorts page.
async function fetchFeedEntries(feedUrl: string): Promise<YouTubeEntry[]> {
	let response = await fetch(feedUrl);

	if (!response.ok) {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		response = await fetch(feedUrl);
	}

	if (!response.ok) {
		throw new Error(
			`Failed to fetch YouTube feed ${feedUrl}: ${response.status} ${response.statusText}`
		);
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
		return [];
	}

	return parsedXml.feed.entry as YouTubeEntry[];
}

function getEntryVideoId(entry: YouTubeEntry): string {
	if (entry['yt:videoId']) {
		return entry['yt:videoId'];
	}
	const ytMatch = (entry.id || '').match(/yt:video:(.+)/);
	return ytMatch ? ytMatch[1] : entry.id || '';
}

function dedupeByVideoId(entries: YouTubeEntry[]): YouTubeEntry[] {
	const entryMap = new Map<string, YouTubeEntry>();
	for (const entry of entries) {
		const videoId = getEntryVideoId(entry);
		if (videoId && !entryMap.has(videoId)) {
			entryMap.set(videoId, entry);
		}
	}
	return Array.from(entryMap.values());
}

// Merge a curated playlist feed with the channel feed (filtered to the right
// video kind) so newly published videos appear even before they are added to
// the playlist.
async function fetchMergedEntries(
	playlistFeedUrl: string,
	wantShorts: boolean
): Promise<YouTubeEntry[]> {
	const [playlistEntries, channelEntries] = await Promise.all([
		fetchFeedEntries(playlistFeedUrl),
		fetchFeedEntries(YOUTUBE_CHANNEL_FEED_URL),
	]);

	const channelEntriesOfKind = channelEntries.filter((entry: YouTubeEntry) => {
		const href = entry.link?.['@_href'] || '';
		return href.includes('/shorts/') === wantShorts;
	});

	return dedupeByVideoId([...playlistEntries, ...channelEntriesOfKind]);
}

// Hashtags become Title Case tags: #agentic-ai -> "Agentic Ai"
function extractHashtagTags(description: string): string[] {
	const hashtags = description.match(/#[\w-]+/g) || [];
	return hashtags.map((tag) =>
		tag
			.substring(1)
			.replace(/-/g, ' ')
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ')
	);
}

// YouTube titles often end in a hashtag run ("... #ai #agents"). Those are
// already tags; in a heading they are just noise.
export function toTitle(title: string): string {
	return title.replace(/(\s+#[\w-]+)+\s*$/, '').trim() || title;
}

// Call-to-action lines: a short label, a colon, then a link — "Full video:",
// "GitHub Repo:", "Learn more:", "📖 Microsoft's model catalogue:". Stripping
// only the URL strands the label ("...Whoops! Full video"), so drop the whole
// line, including any trailing "and find a link to the paper" that likewise
// only made sense while the link was there. Guards: the label is capped at 40
// characters and may not contain sentence-ending punctuation, so a real
// sentence that happens to quote a URL is left alone.
const PROMO_LINE = /^[^\n.!?:]{0,40}:[ \t]*https?:\/\/\S+.*$/gm;

// "The conversation delves into X" — "delves" is a well-worn LLM tell, and
// "the conversation" is a contentless subject, so promote X to the front.
const DELVES_OPENER = /^The (?:conversation|discussion) delves into /i;

// "In this conversation, ..." / 'In this episode of "Securing the Realm," ...'
// Scene-setting filler ahead of the real sentence. The optional quote covers
// the show name being quoted with the comma inside the quotes.
const SCENE_SETTING_OPENER = /^In this (?:conversation|episode|short)\b[^,\n]{0,50},["'”’]?\s+/i;

// Only the leading preamble is stripped: the same phrasing mid-paragraph is
// usually carrying real content by then.
function stripOpener(text: string): string {
	const stripped = text.replace(DELVES_OPENER, '').replace(SCENE_SETTING_OPENER, '');
	return stripped === text ? text : stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

// Sentence-ending punctuation, plus any closing quote or bracket carried along
// with it ('the Realm"!'). The trailing lookahead is the main defence: a real
// break is always followed by whitespace, so a decimal ("version 9.0"), a URL
// path ("arxiv.org/abs/2509.02853") and a file name never read as sentence ends.
const SENTENCE_END = /[.!?]+["'”’)\]]*(?=\s|$)/g;

// Full stops that do not end a sentence. "vs." is the only one that actually
// occurs in the YouTube corpus ("23:52 Optimism vs. Pessimism in Technology"),
// where the following word is capitalised and so gives nothing else away. The
// titles and Latin tags are cheap insurance for a corpus that cites papers and
// co-authors. The trailing single-letter alternative covers initials
// ("J. McDonald") and acronym runs ("U.S."), whose final dot is likewise
// preceded by a lone letter — "of AI." is not caught, because "I" has no word
// boundary in front of it, so it stays a real sentence end.
// Missing an entry here costs a mid-sentence cut; a spurious one only costs a
// missed break, so this list errs towards over-listing.
const ABBREVIATION = /(?:\b(?:vs|etc|eg|ie|al|approx|Dr|Mr|Mrs|Ms|Prof)|\b[A-Za-z])\.$/;

// Whitespace and dangling clause punctuation, so the ellipsis never lands on
// "AI.…" or "agents,…".
const TRAILING_PUNCTUATION = /[\s.,:;!?-]+$/;

// Clause-level punctuation, used as the second-choice cut when the budget holds
// no sentence break. Same trailing-whitespace lookahead as SENTENCE_END, so a
// timestamp ("23:52 Optimism"), a ratio and a thousands separator are not
// mistaken for clause ends.
const CLAUSE_END = /[,;:]["'”’)\]]*(?=\s)/g;

// A clause cut is only worth taking near the end of the budget. Two real cases
// argue for a high bar: the search index composes "<event>: <summary>", putting
// a colon about a quarter of the way in, and a quoted paper title carries its
// own colon ('"The Architecture of AI Transformation: Four Strategic..."').
// Cutting at either throws away most of the excerpt to buy a tidier edge.
const CLAUSE_FLOOR = 0.75;

// Function words that must not be the last word of a word-boundary cut. Without
// this the fallback dangles on the preposition it stopped in front of:
// "...their implications for…", "...securing communications in…", "...the
// concept of agents in AI and…". Content words are never listed, so the trim
// can only ever drop grammatical scaffolding, never a fact.
const TRAILING_FUNCTION_WORD =
	/\s+(?:a|an|and|as|at|but|by|for|from|in|into|its|of|on|or|the|their|to|with)$/i;

// The house style is a spaced hyphen and the site ships no em dashes, but the
// descriptions are YouTube's copy, not ours. Every em dash in the corpus is an
// appositive, spaced or not ("the CIA triangle of security—confidentiality,
// integrity, and availability—"), and a comma would flatten that one into a
// four-item list, so a spaced hyphen replaces both forms. Swallowing the
// surrounding whitespace is what lets the two forms share a rule. Applied after
// the URL strip, so a dash inside a link is already gone rather than mangled.
// ponytail: en dashes get the same spaced hyphen, so a numeric range would come
// out as "2024 - 2025". The corpus has no en dashes at all; split the rule if
// one ever shows up.
const EM_DASH = /\s*[—–]\s*/g;

// Index of the last `breakPattern` match inside `text`, or -1 when there is
// none to trust. `reject` is re-tested against the text up to and including the
// matched character, so an abbreviation check sees the word its dot is attached
// to.
function lastBreak(text: string, breakPattern: RegExp, reject?: RegExp): number {
	let breakAt = -1;
	for (const match of text.matchAll(breakPattern)) {
		const index = match.index ?? 0;
		if (reject?.test(text.slice(0, index + 1))) continue;
		breakAt = index;
	}
	return breakAt;
}

// Tidies the ragged edge of a word-boundary cut: drop trailing punctuation, then
// any function word now left stranded, and repeat, so "computing, and the" comes
// back as "computing" rather than "computing, and".
function trimDangling(fragment: string): string {
	let trimmed = fragment.replace(TRAILING_PUNCTUATION, '');
	let previous = '';
	while (previous !== trimmed) {
		previous = trimmed;
		trimmed = trimmed.replace(TRAILING_FUNCTION_WORD, '').replace(TRAILING_PUNCTUATION, '');
	}
	return trimmed;
}

/**
 * Turns a raw YouTube description into display copy: the URLs and hashtags are
 * already harvested into relatedContent and tags, so on the page they are noise.
 * Drops promo lines and filler openers, normalises em dashes to the house
 * spaced hyphen, then truncates at the last complete sentence that fits.
 *
 * A single very long sentence still has to render, so when the budget holds no
 * sentence break the cut falls back, in order, to the last clause boundary in
 * the final quarter of the budget, then to the last word boundary with any
 * stranded function word trimmed off. Both fallbacks end the excerpt somewhere
 * a reader would pause, rather than wherever the character count ran out.
 */
export function toSummary(description: string, maxLength = 200): string {
	const cleaned = stripOpener(
		description
			.replace(PROMO_LINE, '')
			.replace(/https?:\/\/\S+/g, '')
			.replace(/#[\w-]+/g, '')
			.replace(EM_DASH, ' - ')
			.replace(/\s+/g, ' ')
			.trim()
	).replace(/[\s,:;-]+$/, '');

	if (cleaned.length <= maxLength) return cleaned;

	const budget = cleaned.slice(0, maxLength);

	const sentenceBreak = lastBreak(budget, SENTENCE_END, ABBREVIATION);
	if (sentenceBreak > 0) {
		return `${budget.slice(0, sentenceBreak).replace(TRAILING_PUNCTUATION, '')}…`;
	}

	const clauseBreak = lastBreak(budget, CLAUSE_END);
	if (clauseBreak >= maxLength * CLAUSE_FLOOR) {
		return `${budget.slice(0, clauseBreak).replace(TRAILING_PUNCTUATION, '')}…`;
	}

	const wordBreak = budget.lastIndexOf(' ');
	return `${trimDangling(budget.slice(0, wordBreak > 0 ? wordBreak : budget.length))}…`;
}

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

	const entries = await fetchMergedEntries(YOUTUBE_FEED_URL, false);

	if (entries.length === 0) {
		console.warn('No entries found in YouTube feed');
	}

	const talks = entries.map((entry: YouTubeEntry) => {
		const videoUrl = entry.link['@_href'] || '';
		const publishedDate = new Date(entry.published);

		const description = entry['media:group']?.['media:description'] ?? '';
		const extractedTags = extractHashtagTags(description);

		// Default tags for all YouTube talks
		const defaultTags = ['AI', 'GenAI', 'Agentic Systems', 'Security', 'YouTube', 'Video'];

		// Combine and deduplicate tags
		const allTags = [...new Set([...defaultTags, ...extractedTags])];

		const summary = toSummary(description);

		return {
			title: toTitle(entry.title),
			date: publishedDate,
			event: 'YouTube - Securing the Realm',
			videoUrl,
			summary: summary || 'A video from the Securing the Realm YouTube channel.',
			tags: allTags,
		};
	});

	_cachedTalks = talks;
	return talks;
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

	const entries = await fetchMergedEntries(YOUTUBE_SHORTS_FEED_URL, true);

	if (entries.length === 0) {
		console.warn('No entries found in YouTube Shorts feed');
	}

	const shorts = entries.map((entry: YouTubeEntry) => {
		const videoUrl = entry.link['@_href'] || '';
		const publishedDate = new Date(entry.published);

		const videoId = getYouTubeVideoId(videoUrl) ?? getEntryVideoId(entry);
		const description = entry['media:group']?.['media:description'] ?? '';
		const extractedTags = extractHashtagTags(description);

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
			title: toTitle(entry.title),
			description: toSummary(description),
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
}

/**
 * Extracts YouTube video ID from a URL and returns the embed URL
 * @param url - YouTube video URL (e.g., https://youtube.com/watch?v=...)
 * @returns Embed URL (e.g., https://www.youtube-nocookie.com/embed/...) or null if invalid
 */
export function getYouTubeEmbedUrl(url: string | undefined): string | null {
	const videoId = getYouTubeVideoId(url);
	return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
}

/**
 * Extracts the YouTube video ID from any common URL form.
 * @param url - YouTube URL (watch?v=, youtu.be/<id>, /embed/<id>, /shorts/<id>)
 * @returns The video ID, or null if it can't be determined
 */
export function getYouTubeVideoId(url: string | undefined): string | null {
	if (!url) return null;

	try {
		const urlObj = new URL(url);

		if (urlObj.hostname === 'youtu.be') {
			return urlObj.pathname.slice(1) || null;
		}

		if (urlObj.hostname.includes('youtube.com')) {
			const fromQuery = urlObj.searchParams.get('v');
			if (fromQuery) return fromQuery;

			const match = urlObj.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
			if (match) return match[1];
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Builds the standard YouTube thumbnail URL for a video URL.
 * @param url - YouTube video URL
 * @returns Thumbnail URL (hqdefault.jpg) or null if the ID can't be determined
 */
export function getYouTubeThumbnailUrl(url: string | undefined): string | null {
	const videoId = getYouTubeVideoId(url);
	return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;
}
