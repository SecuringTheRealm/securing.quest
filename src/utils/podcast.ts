export interface PodcastPlatform {
	label: string;
	href: string;
}

// Single source of truth for the podcast's listen/subscribe surfaces.
// The show has no custom podcast RSS feed.
export const PODCAST_PLATFORMS: readonly PodcastPlatform[] = [
	{ label: 'Spotify', href: 'https://open.spotify.com/show/1Yo0bHunKuloEXda0Zn3t2' },
	{
		label: 'Apple Podcasts',
		href: 'https://podcasts.apple.com/gb/podcast/securing-the-realm/id1835736136',
	},
	{ label: 'YouTube', href: 'https://www.youtube.com/@SecuringTheRealm' },
] as const;
