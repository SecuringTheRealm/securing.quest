import { describe, expect, test } from 'bun:test';
import { rankItems } from './search-rank';

const ITEMS = [
	{ title: 'Purview MCP', description: 'Agentic data security', tags: ['Purview', 'MCP'] },
	{ title: 'Castle defence', description: 'Purview shows up in the body', tags: ['Azure'] },
	{ title: 'Dragons', description: 'Nothing relevant', tags: ['purview'] },
];

describe('rankItems', () => {
	test('ranks title matches above description above tags', () => {
		expect(rankItems(ITEMS, 'purview').map((item) => item.title)).toEqual([
			'Purview MCP',
			'Castle defence',
			'Dragons',
		]);
	});

	test('requires every term to match somewhere', () => {
		expect(rankItems(ITEMS, 'purview kobold')).toEqual([]);
		expect(rankItems(ITEMS, 'purview agentic').map((item) => item.title)).toEqual(['Purview MCP']);
	});

	test('returns nothing for an empty query', () => {
		expect(rankItems(ITEMS, '   ')).toEqual([]);
	});
});
