interface QuestLogItem {
	date: Date;
	realm: string;
	url: string;
}

export function selectQuestLog<T extends QuestLogItem>(items: readonly T[]): T[] {
	const sorted = [...items].sort((a: T, b: T) => b.date.valueOf() - a.date.valueOf());
	const visible = sorted.slice(0, 6);
	const [lead, ...rows] = visible;
	if (!lead || rows.some((item: T) => item.realm === 'moon')) return visible;

	const short = sorted.find((item: T) => item.realm === 'moon' && item.url !== lead.url);
	if (!short) return visible;

	return [lead, ...rows.slice(0, 4), short].sort(
		(a: T, b: T) => b.date.valueOf() - a.date.valueOf()
	);
}
