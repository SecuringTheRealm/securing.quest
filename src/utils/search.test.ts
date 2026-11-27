import { describe, expect, test } from 'bun:test';
import { getDedupedYouTubeTalks } from './talks';

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
