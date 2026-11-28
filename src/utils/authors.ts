export interface AuthorLink {
	label: string;
	href: string;
}

export type AuthorBioPart = string | AuthorLink;

export interface Author {
	id: 'chris' | 'josh';
	name: string;
	postNominals?: string;
	role: string;
	bio: readonly (readonly AuthorBioPart[])[];
	links: AuthorLink[];
}

export const AUTHORS: Record<'chris' | 'josh', Author> = {
	chris: {
		id: 'chris',
		name: 'Chris Lloyd-Jones',
		postNominals: 'MIET',
		role: 'AI transformation and platform engineering · Co-host',
		bio: [
			[
				'Chris builds AI platforms and the teams that run them. At Kyndryl, he created the Forward Deployed Engineering capability so engineers could build software alongside clients and stay responsible for it. His background in law and engineering shapes the questions he brings to Securing the Realm. What is an agent authorised to do? How do you test those limits? Who owns the outcome when it gets something wrong?',
			],
			[
				'Chris is a seven-time Microsoft MVP in AI and Developer Technologies and co-leads the Seattle chapter of the Global AI Community. The community named him ',
				{
					label: 'Organizer of the Week',
					href: 'https://globalai.community/awards/organizer-of-the-week/2026-W48',
				},
				' for the week of 23 November 2026. He researches Green AI at the University of East London, contributed to the Software Carbon Intensity standard and received ',
				{ label: 'OpenUK New Year Honours', href: 'https://openuk.uk/honours/' },
				' in 2026 for his open source contributions.',
			],
		],
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
		bio: [
			[
				"Josh McDonald is a two-time Microsoft MVP in AI, awarded in the Trustworthy AI category, and a data and AI security specialist at Avanade. He leads Avanade's Global Security SME team and its Data Security community of practice, working closely with the Microsoft product group on Microsoft Purview and driving security innovation within the Office of the CTO. On his KnowledgeRatio blog he explores the intersection of AI, work, and security, championing least-privilege and trustworthy AI for the enterprise.",
			],
		],
		links: [
			{ label: 'Blog', href: 'https://knowledgeratio.github.io/KnowledgeRatio/' },
			{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/joshmcdonalduk/' },
			{ label: 'GitHub', href: 'https://github.com/KnowledgeRatio' },
			{ label: 'Microsoft MVP', href: 'https://mvp.microsoft.com/en-us/PublicProfile/466754' },
		],
	},
};
