export interface RankableItem {
	title: string;
	description: string;
	tags: string[];
}

/**
 * Substring match, weighted title > description > tags. Every term must match
 * somewhere. The index is a few dozen items, so a linear scan beats shipping a
 * search library.
 */
export function rankItems<T extends RankableItem>(items: readonly T[], query: string): T[] {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return [];

	const scored: { item: T; score: number }[] = [];

	for (const item of items) {
		const title = item.title.toLowerCase();
		const description = item.description.toLowerCase();
		const tags = item.tags.join(' ').toLowerCase();

		let score = 0;
		for (const term of terms) {
			if (title.includes(term)) score += 3;
			else if (description.includes(term)) score += 2;
			else if (tags.includes(term)) score += 1;
			else {
				score = 0;
				break;
			}
		}

		if (score > 0) scored.push({ item, score });
	}

	return scored.sort((a, b) => b.score - a.score).map((entry) => entry.item);
}
