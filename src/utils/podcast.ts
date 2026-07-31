export interface PodcastPlatform {
	label: string;
	href: string;
	/** Primary destinations, rendered as filled cartridges. The rest are outlined. */
	filled?: boolean;
}

// Single source of truth for the podcast's listen/subscribe surfaces.
// The show has no custom podcast RSS feed.
export const PODCAST_PLATFORMS: readonly PodcastPlatform[] = [
	{ label: 'YouTube', href: 'https://www.youtube.com/@SecuringTheRealm', filled: true },
	{
		label: 'Apple Podcasts',
		href: 'https://podcasts.apple.com/gb/podcast/securing-the-realm/id1835736136',
		filled: true,
	},
	{ label: 'Spotify', href: 'https://open.spotify.com/show/1Yo0bHunKuloEXda0Zn3t2' },
	{ label: 'Deezer', href: 'https://www.deezer.com/en/show/1003402722' },
	{
		label: 'iHeartRadio',
		href: 'https://www.iheart.com/podcast/269-securing-the-realm-338714716/',
	},
	{
		label: 'Amazon Music',
		href: 'https://music.amazon.co.uk/podcasts/8b7e89e9-f458-499f-9237-987f6db85708/securing-the-realm',
	},
] as const;
