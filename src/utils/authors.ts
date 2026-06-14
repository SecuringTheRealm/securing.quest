export interface AuthorLink {
	label: string;
	href: string;
}

export interface Author {
	id: 'chris' | 'josh';
	name: string;
	role: string;
	bio: string;
	links: AuthorLink[];
}

export const AUTHORS: Record<'chris' | 'josh', Author> = {
	chris: {
		id: 'chris',
		name: 'Chris Lloyd-Jones',
		role: 'VP, AI Consulting Transformation · Kyndryl',
		bio: 'Chris Lloyd-Jones is VP for AI Consulting Transformation at Kyndryl, where he created and leads the Forward Deployed Engineering capability that pairs engineers directly with clients. A six-time Microsoft MVP in AI, he is also a doctoral researcher in green software engineering and a contributor to the ISO/IEC 21031:2024 Software Carbon Intensity standard. His work spans agentic AI, open source, and sustainable, secure-by-design systems, and in 2026 he was recognised in the OpenUK New Year Honours for his open source contributions.',
		links: [
			{ label: 'Website', href: 'https://sealjay.com/about' },
			{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/chrislloydjones/' },
			{ label: 'GitHub', href: 'https://github.com/sealjay' },
			{ label: 'Microsoft MVP', href: 'https://mvp.microsoft.com/en-us/PublicProfile/5004204' },
		],
	},
	josh: {
		id: 'josh',
		name: 'Josh McDonald',
		role: 'Data & AI Security Lead · Avanade',
		bio: "Josh McDonald is a Microsoft MVP in AI, awarded in the Trustworthy AI category, and a data and AI security specialist at Avanade. He leads Avanade's Global Security SME team and its Data Security community of practice, working closely with the Microsoft product group on Microsoft Purview and driving security innovation within the Office of the CTO. On his KnowledgeRatio blog he explores the intersection of AI, work, and security, championing least-privilege and trustworthy AI for the enterprise.",
		links: [
			{ label: 'Blog', href: 'https://knowledgeratio.github.io/KnowledgeRatio/' },
			{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/joshmcdonalduk/' },
			{ label: 'GitHub', href: 'https://github.com/KnowledgeRatio' },
			{ label: 'Microsoft MVP', href: 'https://mvp.microsoft.com/en-us/PublicProfile/466754' },
		],
	},
};
