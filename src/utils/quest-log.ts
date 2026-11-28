interface QuestLogItem {
	date: Date;
	url: string;
	kind: string;
	embedUrl: string | null;
}

export function selectQuestLog<T extends QuestLogItem>(items: readonly T[]) {
	const sorted = [...items].sort((a: T, b: T) => b.date.valueOf() - a.date.valueOf());
	const featured = sorted.find(
		(item: T) => item.embedUrl && (item.kind === 'Full episode' || item.kind === 'Short')
	);
	return {
		featured,
		rows: sorted.filter((item: T) => item.url !== featured?.url).slice(0, 5),
	};
}
