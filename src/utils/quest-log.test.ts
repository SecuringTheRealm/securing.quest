import { describe, expect, test } from 'bun:test';
import { selectQuestLog } from './quest-log';

const item = (day: number, kind = 'Full episode', playable = true) => ({
	date: new Date(Date.UTC(2026, 10, day)),
	kind,
	url: `/item/${day}`,
	embedUrl: playable ? `https://www.youtube-nocookie.com/embed/${day}` : null,
});

describe('selectQuestLog', () => {
	test('handles an empty feed', () => {
		expect(selectQuestLog([])).toEqual({ featured: undefined, rows: [] });
	});

	test('selects a playable episode even when other content is newer', () => {
		const episode = item(10);
		const newer = [
			item(14, 'Article', false),
			item(13, 'Conference talk'),
			item(12, 'Workshop', false),
			item(11, 'Full episode', false),
		];
		const short = item(9, 'Short');
		expect(selectQuestLog([short, episode, ...newer])).toEqual({
			featured: episode,
			rows: [...newer, short],
		});
	});

	test('leaves the log intact when there are no playable episodes or Shorts', () => {
		const article = item(2, 'Article', false);
		expect(selectQuestLog([article])).toEqual({ featured: undefined, rows: [article] });
	});

	test('rotates to a newer Short and lists the five latest other items in order', () => {
		const short = item(10, 'Short');
		const episodes = [item(9), item(8), item(7), item(6), item(5)];
		expect(selectQuestLog([item(4, 'Short'), ...episodes, short])).toEqual({
			featured: short,
			rows: episodes,
		});
	});
});
