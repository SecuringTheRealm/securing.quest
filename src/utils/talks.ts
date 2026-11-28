import type { YouTubeTalk } from './youtube';
import { getYouTubeVideoId } from './youtube';

export interface ManualTalkLike {
	id: string;
	data: {
		videoUrl?: string;
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
		return videoId !== null && !manualVideoIds.has(videoId);
	});
}
