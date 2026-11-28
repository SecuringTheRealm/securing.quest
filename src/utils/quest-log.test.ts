import { describe, expect, test } from 'bun:test';
import { selectQuestLog } from './quest-log';

const item = (day: number, realm = 'tower') => ({
	date: new Date(Date.UTC(2026, 10, day)),
	realm,
	url: `/${realm}/${day}`,
});

describe('selectQuestLog', () => {
	test('handles an empty feed', () => {
		expect(selectQuestLog([])).toEqual([]);
	});

	test('does not repeat the only Short when that Short leads', () => {
		const short = item(10, 'moon');
		const talk = item(9);
		expect(selectQuestLog([talk, short])).toEqual([short, talk]);
	});

	test('makes room for the newest distinct Short behind the lead', () => {
		const lead = item(10, 'moon');
		const talks = [item(9), item(8), item(7), item(6), item(5)];
		const short = item(4, 'moon');
		expect(selectQuestLog([item(3, 'moon'), short, ...talks, lead])).toEqual([
			lead,
			...talks.slice(0, 4),
			short,
		]);
	});
});
