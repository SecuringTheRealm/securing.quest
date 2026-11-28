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
				'Chris builds AI platforms and the teams that run them. At Kyndryl, he set up Forward Deployed Engineering so engineers could build software alongside clients and stay responsible for it. His background is in law and engineering. On the podcast, he asks who decides what an agent can do and who answers when it gets something wrong.',
			],
			[
				'A seven-time Microsoft MVP in AI and Developer Technologies, Chris co-leads the Global AI Community’s Seattle chapter. The community named him ',
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
				'Josh works on data security and AI governance at Avanade. He leads the company’s global team of security specialists and its data security community of practice and works with the Microsoft Purview product team. On Securing the Realm, he and Chris have looked at what happens when agents share information and how much access each one actually needs.',
			],
			[
				'Microsoft first recognised Josh as an MVP for Trustworthy AI. He now holds MVP awards in Microsoft Foundry and Developer Security. On his KnowledgeRatio blog he writes about AI at work. He also writes about the work people take on alongside their day jobs, a subject he calls “side of desk” culture.',
			],
		],
		links: [
			{ label: 'Blog', href: 'https://knowledgeratio.github.io/KnowledgeRatio/' },
			{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/joshmcdonaldmvp/' },
			{ label: 'GitHub', href: 'https://github.com/KnowledgeRatio' },
			{ label: 'Microsoft MVP', href: 'https://mvp.microsoft.com/en-us/PublicProfile/466754' },
		],
	},
};
