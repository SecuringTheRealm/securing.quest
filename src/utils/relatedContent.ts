export interface RelatedEntry {
	type: 'blog' | 'talk' | 'project' | 'external';
	slug: string;
	title?: string;
}

export interface ResolvedRelated {
	type: RelatedEntry['type'];
	url: string;
	title: string;
}

// Resolve a related entry to a site URL. Blog posts have their own page;
// talks and projects are anchored on their realm index; external is a full URL.
function resolveUrl(entry: RelatedEntry): string {
	switch (entry.type) {
		case 'external':
			return entry.slug;
		case 'blog':
			return `/blog/${entry.slug}/`;
		case 'talk':
			return `/talks/#${entry.slug}`;
		case 'project':
			return `/forge/#${entry.slug}`;
	}
}

export function resolveRelated(entries: RelatedEntry[]): ResolvedRelated[] {
	return entries.map(
		(entry: RelatedEntry): ResolvedRelated => ({
			type: entry.type,
			url: resolveUrl(entry),
			title: entry.title ?? `Related ${entry.type}`,
		})
	);
}
