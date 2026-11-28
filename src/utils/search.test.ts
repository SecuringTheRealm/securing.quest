import { describe, expect, test } from 'bun:test';
import { getDedupedYouTubeTalks, getFormerTalkAnchor, getTalkCatalogue } from './talks';
import type { YouTubeTalk } from './youtube';

describe('getDedupedYouTubeTalks', () => {
	test('removes manual duplicates and preserves feed order for re-indexed anchors', () => {
		const manualTalks = [
			{
				id: 'manual-talk',
				data: { videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk' },
			},
		];
		const youtubeTalks = [
			{
				title: 'Manual duplicate',
				date: new Date('2025-01-01'),
				event: 'Event',
				videoUrl: 'https://youtu.be/abcdefghijk',
				summary: 'Duplicate',
				tags: ['Azure'],
			},
			{
				title: 'Feed talk',
				date: new Date('2025-01-02'),
				event: 'Event',
				videoUrl: 'https://www.youtube.com/watch?v=lmnopqrstuv',
				summary: 'Feed',
				tags: ['AI'],
			},
		];

		const deduped = getDedupedYouTubeTalks(manualTalks, youtubeTalks);

		expect(deduped).toEqual([youtubeTalks[1]]);
		expect(deduped[0]).toBe(youtubeTalks[1]);
	});
});

describe('Deepfakes episode reupload', () => {
	const original = {
		id: 'securing-the-realm-deepfakes-ai-fraud-and-authenti',
		data: { videoUrl: 'https://www.youtube.com/watch?v=JqpfN8vmTxc' },
	};
	const reupload = {
		id: 'deepfakes-ai-fraud-and-authenticity',
		data: { videoUrl: 'https://www.youtube.com/watch?v=Nf1XwwfJT5M' },
	};
	const feedVideo = (videoUrl: string): YouTubeTalk => ({
		title: 'Deepfakes',
		date: new Date('2025-08-26'),
		event: 'YouTube - Securing the Realm',
		videoUrl,
		summary: '',
		tags: [],
	});

	test('lists the original, retaining the incoming fragment on its heading', () => {
		const conference = { id: 'conference', data: {} };
		const { manualTalks } = getTalkCatalogue([reupload, conference, original], []);
		expect(manualTalks).toEqual([conference, original]);
		expect(getFormerTalkAnchor(original.data.videoUrl)).toBe(reupload.id);
		expect(getFormerTalkAnchor(undefined)).toBeUndefined();
	});

	test('neither resurfacing upload takes an indexed anchor away from another video', () => {
		const first = feedVideo('https://youtu.be/12345678901');
		const next = feedVideo('https://youtu.be/12345678902');
		const withReuploads = [
			feedVideo('https://youtu.be/Nf1XwwfJT5M'),
			first,
			feedVideo('https://youtu.be/JqpfN8vmTxc'),
			next,
		];
		expect(getTalkCatalogue([original, reupload], withReuploads).youtubeTalks).toEqual([
			first,
			next,
		]);
		expect(getTalkCatalogue([original], withReuploads).youtubeTalks).toEqual([first, next]);
	});
});
