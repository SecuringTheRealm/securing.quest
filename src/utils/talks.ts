import type { YouTubeTalk } from './youtube';
import { getYouTubeVideoId } from './youtube';

export interface ManualTalkLike {
	id: string;
	data: {
		videoUrl?: string;
	};
}

// The same episode was uploaded again after the move to Riverside. Keep the
// original video and both incoming catalogue fragments.
const DEEPFAKES_ORIGINAL = 'JqpfN8vmTxc';
const DEEPFAKES_REUPLOAD = 'Nf1XwwfJT5M';

export function getFormerTalkAnchor(videoUrl: string | undefined): string | undefined {
	return getYouTubeVideoId(videoUrl) === DEEPFAKES_ORIGINAL
		? 'deepfakes-ai-fraud-and-authenticity'
		: undefined;
}

export function getTalkCatalogue<T extends ManualTalkLike>(
	manualTalks: readonly T[],
	youtubeTalks: readonly YouTubeTalk[]
): { manualTalks: T[]; youtubeTalks: YouTubeTalk[] } {
	return {
		manualTalks: manualTalks.filter(
			(talk: T) => getYouTubeVideoId(talk.data.videoUrl) !== DEEPFAKES_REUPLOAD
		),
		youtubeTalks: getDedupedYouTubeTalks(manualTalks, youtubeTalks),
	};
}

export function getDedupedYouTubeTalks(
	manualTalks: readonly ManualTalkLike[],
	youtubeTalks: readonly YouTubeTalk[]
): YouTubeTalk[] {
	const manualVideoIds = new Set(
		manualTalks
			.map((talk: ManualTalkLike) => getYouTubeVideoId(talk.data.videoUrl))
			.filter((videoId: string | null): videoId is string => videoId !== null)
	);

	return youtubeTalks.filter((talk: YouTubeTalk) => {
		const videoId = getYouTubeVideoId(talk.videoUrl);
		return videoId !== null && videoId !== DEEPFAKES_REUPLOAD && !manualVideoIds.has(videoId);
	});
}

export type TalkKind = 'Full episode' | 'Conference talk' | 'Workshop';

export function getTalkKind(event: string, tags: readonly string[]): TalkKind {
	if (/\bworkshop\b/i.test(event) || tags.includes('Workshop')) return 'Workshop';
	if (event === 'YouTube - Securing the Realm' && !tags.includes('In Person'))
		return 'Full episode';
	return 'Conference talk';
}
