import { describe, expect, test } from 'bun:test';
import { toSummary, toTitle } from './youtube';

describe('toSummary', () => {
	test('strips the URLs and hashtags that tags and relatedContent already carry', () => {
		expect(
			toSummary(
				'What happens when AI deletes your codebase? Whoops!\nFull video: https://www.youtube.com/watch?v=aUEcOlT5eMA\n#AI #GenAI #MVPBuzz'
			)
		).toBe('What happens when AI deletes your codebase? Whoops!');
	});

	test('truncates on a word boundary, never mid-word', () => {
		const summary = toSummary('alpha bravo charlie delta echo', 14);
		expect(summary).toBe('alpha bravo…');
	});

	test('leaves short descriptions alone', () => {
		expect(toSummary('A short from the channel.')).toBe('A short from the channel.');
	});

	test('drops a "Full video:" line rather than stranding the label', () => {
		expect(
			toSummary(
				'Imagine AI could just join the conversation. Not because you asked it to - but because it knew when to.\nFull video: https://www.youtube.com/watch?v=_OaCJceqgho\n#AI #GenAI #MVPBuzz'
			)
		).toBe(
			'Imagine AI could just join the conversation. Not because you asked it to - but because it knew when to.'
		);
	});

	test('drops the whole promo line, not just the URL inside it', () => {
		// The call to action continues past the link ("and find a link to the
		// original paper"), so removing only the URL leaves "Full video: and
		// find a link..." pointing at nothing.
		expect(
			toSummary(
				'The future of work isn’t automation versus people. It’s about designing resilient, adaptive systems where both thrive.\nFull video: https://youtu.be/oNmquoKw3oE and find a link to the original paper by Diana Wolfe, Alice Choe and Fergus Kidd.\n#AI #GenAI #MVPBuzz'
			)
		).toBe(
			'The future of work isn’t automation versus people. It’s about designing resilient, adaptive systems where both thrive.'
		);
	});

	test('drops an emoji-led promo line', () => {
		expect(
			toSummary(
				"Most people think Microsoft Foundry is just about OpenAI models. It's not.\n\n\u{1F4D6} Microsoft's model catalogue: https://learn.microsoft.com/en-us/azure/ai-foundry/foundry-models/concepts/models-sold-directly-by-azure?WT.mc_id=AI-MVP-5004204"
			)
		).toBe("Most people think Microsoft Foundry is just about OpenAI models. It's not.");
	});

	test('keeps a sentence that merely happens to contain a colon and a link', () => {
		expect(
			toSummary('We asked the obvious question: can you trust it? https://example.com/paper')
		).toBe('We asked the obvious question: can you trust it?');
	});

	test('keeps a long label that is prose rather than a promo tag', () => {
		const prose =
			'The one thing every security team keeps getting wrong about agent identity: https://example.com';
		expect(toSummary(prose)).toBe(
			'The one thing every security team keeps getting wrong about agent identity'
		);
	});

	test('strips the "delves into" opener and recapitalises', () => {
		expect(
			toSummary(
				'The conversation delves into the evolving landscape of AI and securing it, focusing on regulatory and legal drivers.'
			)
		).toBe(
			'The evolving landscape of AI and securing it, focusing on regulatory and legal drivers.'
		);
	});

	test('strips "In this conversation," but keeps who is speaking', () => {
		expect(
			toSummary(
				'In this conversation, Chris Lloyd-Jones and Josh McDonald discuss the use of Foundry Local for securely generating sensitive AI content.'
			)
		).toBe(
			'Chris Lloyd-Jones and Josh McDonald discuss the use of Foundry Local for securely generating sensitive AI content.'
		);
	});

	test('strips "In this episode of ..." with the comma inside the quotes', () => {
		expect(
			toSummary(
				'In this episode of "Securing the Realm," we discuss the mystifying world of deepfakes and shallow fakes.'
			)
		).toBe('We discuss the mystifying world of deepfakes and shallow fakes.');
	});

	test('leaves the same phrasing alone mid-paragraph, where it carries content', () => {
		const description =
			'Who controls access when AI agents handle data and tasks? In this short, we explain how Azure AI Foundry uses Entra ID.';
		expect(toSummary(description)).toBe(description);
	});

	test('leaves an opener that is not filler', () => {
		expect(toSummary('In this age of agents, identity is the new perimeter.')).toBe(
			'In this age of agents, identity is the new perimeter.'
		);
	});
});

describe('toSummary sentence truncation', () => {
	// Both descriptions are the real feed text behind excerpts that shipped
	// dangling mid-clause ("He explores the definition of...", "Kevin McDonnell
	// shares his...") on the homepage.
	const NEMA =
		'Nema Sobhani, a data scientist at Avanade, discusses the concept of agents in AI and their impact on human activities. He explores the definition of agents, their role in the enterprise, and the ethical and social implications of their use. The conversation delves into the evaluation and governance of AI models, as well as the philosophical and practical considerations of human-AI interaction.';

	const KEVIN =
		'The conversation delves into the future of AI, discussing its accessibility, the concept of ambient computing, and the ethical governance of AI. Kevin McDonnell shares his insights and a one of his own take aways from the app that started the series!';

	test('cuts at the last whole sentence instead of dangling on "the definition of"', () => {
		expect(toSummary(NEMA, 150)).toBe(
			'Nema Sobhani, a data scientist at Avanade, discusses the concept of agents in AI and their impact on human activities…'
		);
	});

	test('cuts at the last whole sentence instead of dangling on "shares his"', () => {
		expect(toSummary(KEVIN, 220)).toBe(
			'The future of AI, discussing its accessibility, the concept of ambient computing, and the ethical governance of AI…'
		);
	});

	test('ends with one ellipsis, not "of AI...." — no doubled punctuation', () => {
		// The old word-boundary cut landed just past "governance of AI." and
		// appended "...", giving four dots.
		const summary = toSummary(KEVIN, 120);
		expect(summary.endsWith('governance of AI…')).toBe(true);
		expect(summary).not.toContain('...');
		expect(summary).not.toContain('.…');
	});

	test('falls back to a word boundary when one sentence overruns the budget', () => {
		// No sentence break and no clause punctuation anywhere in the budget, so
		// the word boundary is all that is left. The dangling "and" still goes.
		expect(
			toSummary(
				'A single unbroken clause about agentic identity and governance that simply refuses to stop for breath anywhere at all',
				60
			)
		).toBe('A single unbroken clause about agentic identity…');
	});

	test('does not split on "vs." in a chapter list', () => {
		// The only real abbreviation in the YouTube corpus. "Pessimism" is
		// capitalised, so nothing but the word list distinguishes it.
		expect(
			toSummary(
				'Deepfakes are cheaper to create than ever before, and detection lags behind them. 23:52 Optimism vs. Pessimism in Technology Adoption 27:07 Conclusion and final thoughts from the hosts.',
				150
			)
		).toBe('Deepfakes are cheaper to create than ever before, and detection lags behind them…');
	});

	test('does not split on a decimal version number', () => {
		expect(
			toSummary(
				'Foundry Local shipped version 9.0 to general availability last week and it changes things.',
				60
			)
		).toBe('Foundry Local shipped version 9.0 to general availability…');
	});

	test('does not split on initials in a citation', () => {
		expect(
			toSummary(
				'The paper by J. McDonald and A. Choe argues that agent identity is the new perimeter of the enterprise.',
				60
			)
		).toBe('The paper by J. McDonald and A. Choe argues that agent…');
	});

	test('does not split inside an acronym run like "U.S."', () => {
		expect(
			toSummary(
				'The U.S. regulator published guidance that reshapes how enterprises govern their agent fleets today.',
				60
			)
		).toBe('The U.S. regulator published guidance that reshapes how…');
	});

	test('still treats a two-letter acronym like "AI." as a real sentence end', () => {
		// The initials guard must not swallow this: "I" has no word boundary in
		// front of it, so "AI." stays a sentence end.
		expect(
			toSummary(
				'Everything here is about the commoditization of AI. Kevin then explains what that means for teams.',
				60
			)
		).toBe('Everything here is about the commoditization of AI…');
	});

	test('ends a sentence on "?" and on "!"', () => {
		expect(
			toSummary(
				'Who controls access when AI agents handle data and tasks? We explain how Foundry uses Entra ID for this.',
				70
			)
		).toBe('Who controls access when AI agents handle data and tasks…');

		expect(
			toSummary(
				'What happens when AI deletes your codebase? Whoops! We walk through the whole postmortem in detail.',
				70
			)
		).toBe('What happens when AI deletes your codebase? Whoops…');
	});

	test('keeps a closing quote that belongs to the sentence it ends', () => {
		expect(
			toSummary(
				'Welcome to a festive "Securing the Realm"! Josh and Chris are joined by Diana Wolfe and Fergus Kidd.',
				70
			)
		).toBe('Welcome to a festive "Securing the Realm"…');
	});

	test('leaves a description that fits the budget completely alone', () => {
		// No ellipsis, and the closing full stop survives.
		expect(toSummary('A short from the channel.', 200)).toBe('A short from the channel.');
	});
});

describe('toSummary clause-boundary fallback', () => {
	// Every fixture in this block is the exact feed text behind an excerpt that
	// shipped dangling mid-clause. ROUNDUP and ARCHITECTURE are the two /talks/
	// excerpts ("...and the nature of…", "...Alice Choe and Fergus…"); the rest
	// reach the search index, which composes "<event>: <summary>" and so has
	// roughly 30 characters less room than the page it came from.
	const ROUNDUP =
		'The conversation delves into the evolving landscape of AI and securing it, focusing on regulatory and legal drivers, the commoditization of AI, security & governance challenges, open source and commodification, and the nature of observability. Each chapter explores these themes in depth, providing valuable insights into the current state of AI technology and its impact on various industries.';

	const ARCHITECTURE =
		'Diana Wolfe joins Chris and Josh to discuss the new paper "The Architecture of AI Transformation: Four Strategic Patterns and an Emerging Frontier" co-authored by Diana Wolfe, Alice Choe and Fergus Kidd; and discussing the transformative potential of AI in organizations, exploring the concept of agentic AI and its implications for leadership and collaboration.';

	const VIBE_CODING =
		'In this conversation, Chris and Josh explore the latest features of GitHub Copilot, particularly focusing on agentic AI and its implications for software development. They discuss the concept of vibe engineering versus vibe coding, emphasizing the need for subject matter expertise when utilizing AI tools.';

	const PURVIEW =
		'In this conversation, Josh McDonald and Chris Lloyd-Jones discuss the importance of securing communications in the realm of agentic AI. They explore the CIA triangle of security—confidentiality, integrity, and availability—and how Microsoft Purview serves as a data security solution.';

	const DEEPFAKES =
		'In this episode of "Securing the Realm," we discuss the mystifying world of deepfakes and shallow fakes and their implications for security and media trust. Hosts Josh McDonald and Chris Lloyd-Jones - with special guest Fergus Kidd - guide you through real examples of deepfakes.';

	test('cuts the list at a comma instead of dangling on "and the nature of"', () => {
		// The first sentence runs to 240 characters, so no sentence break fits a
		// 200 budget at all. The comma after "commodification" sits at 93% of the
		// budget, so almost nothing is given up to land on it.
		expect(toSummary(ROUNDUP, 200)).toBe(
			'The evolving landscape of AI and securing it, focusing on regulatory and legal drivers, the commoditization of AI, security & governance challenges, open source and commodification…'
		);
	});

	test('does not cut a co-author list in the middle of a name', () => {
		// Shipped as "...Alice Choe and Fergus…", chopping Fergus Kidd in half.
		expect(toSummary(ARCHITECTURE, 200)).toBe(
			'Diana Wolfe joins Chris and Josh to discuss the new paper "The Architecture of AI Transformation: Four Strategic Patterns and an Emerging Frontier" co-authored by Diana Wolfe…'
		);
	});

	test('keeps the quoted paper title whole rather than cutting at its colon', () => {
		// The title carries its own colon a third of the way into a 150 budget.
		// Taking it would cost half the excerpt, which the clause floor forbids.
		expect(toSummary(ARCHITECTURE, 150)).toBe(
			'Diana Wolfe joins Chris and Josh to discuss the new paper "The Architecture of AI Transformation: Four Strategic Patterns and an Emerging Frontier"…'
		);
	});

	test('does not cut at the "<event>:" colon the search index prepends', () => {
		// That colon is only 28 characters in, so honouring it would leave the
		// search result showing nothing but the show name.
		expect(toSummary(`YouTube - Securing the Realm: ${toSummary(VIBE_CODING)}`, 120)).toBe(
			'YouTube - Securing the Realm: Chris and Josh explore the latest features of GitHub Copilot…'
		);
	});

	test('trims a dangling preposition when only a word boundary is available', () => {
		// No clause punctuation in the budget at all, so this is the word-boundary
		// path. Shipped as "...securing communications in…".
		expect(toSummary(`YouTube - Securing the Realm: ${toSummary(PURVIEW)}`, 120)).toBe(
			'YouTube - Securing the Realm: Josh McDonald and Chris Lloyd-Jones discuss the importance of securing communications…'
		);
	});

	test('trims a dangling "for" rather than pointing at nothing', () => {
		// Shipped as "...and their implications for…".
		expect(toSummary(`YouTube - Securing the Realm: ${toSummary(DEEPFAKES)}`, 120)).toBe(
			'YouTube - Securing the Realm: We discuss the mystifying world of deepfakes and shallow fakes and their implications…'
		);
	});

	test('trims a whole dangling "and the" run, not just the last word', () => {
		expect(
			toSummary(
				'YouTube - Securing the Realm: The future of AI, discussing its accessibility, the concept of ambient computing, and the ethical governance of AI…',
				120
			)
		).toBe(
			'YouTube - Securing the Realm: The future of AI, discussing its accessibility, the concept of ambient computing…'
		);
	});

	test('re-truncating an already-summarised excerpt stays clean', () => {
		// The homepage and the search index both feed toSummary its own output,
		// and the "…" it appended is not a sentence break, so the second pass has
		// to find its own resting place.
		const once = toSummary(ROUNDUP, 200);
		const twice = toSummary(once, 150);
		expect(twice).toBe(
			'The evolving landscape of AI and securing it, focusing on regulatory and legal drivers, the commoditization of AI, security & governance challenges…'
		);
		expect(twice).not.toContain('…,');
		expect(twice.split('…')).toHaveLength(2);
	});

	test('prefers a real sentence break over any clause boundary', () => {
		// The clause floor must not outrank a whole sentence that fits, even when
		// the sentence uses less than half the budget.
		expect(
			toSummary(
				"Most people think Microsoft Foundry is just about OpenAI models. It's not. If you're building on Azure and only looking at OpenAI endpoints, you're leaving options on the table.",
				150
			)
		).toBe("Most people think Microsoft Foundry is just about OpenAI models. It's not…");
	});

	test('ignores a clause boundary too early in the budget to be worth taking', () => {
		// "Well," is 5 characters into a 120 budget. Cutting there would throw the
		// excerpt away to buy a comma, so the word boundary wins instead.
		expect(
			toSummary(
				'Well, the whole point of an agent identity perimeter is that every single call carries a verifiable claim about who is asking and why they want it',
				120
			)
		).toBe(
			'Well, the whole point of an agent identity perimeter is that every single call carries a verifiable claim about who is…'
		);
	});

	test('does not read a chapter timestamp as a clause boundary', () => {
		// "23:52" would otherwise offer a colon; the lookahead needs whitespace
		// straight after it, and a timestamp has a digit there.
		expect(
			toSummary(
				'Deepfakes are cheaper to create than ever before and detection lags well behind 23:52 Optimism and Pessimism in Technology Adoption 27:07 Conclusion',
				120
			)
		).toBe(
			'Deepfakes are cheaper to create than ever before and detection lags well behind 23:52 Optimism and Pessimism…'
		);
	});
});

describe('toSummary em dash normalisation', () => {
	test('turns the real unspaced "security—confidentiality" pair into spaced hyphens', () => {
		// A comma would flatten this into a four-item list and lose that
		// security is the thing the other three define.
		expect(
			toSummary(
				'They explore the CIA triangle of security—confidentiality, integrity, and availability—and how Microsoft Purview serves as a data security solution.',
				200
			)
		).toBe(
			'They explore the CIA triangle of security - confidentiality, integrity, and availability - and how Microsoft Purview serves as a data security solution.'
		);
	});

	test('collapses a spaced em dash to a single spaced hyphen', () => {
		expect(
			toSummary('Agent identity — the new perimeter — is what teams keep getting wrong.', 200)
		).toBe('Agent identity - the new perimeter - is what teams keep getting wrong.');
	});

	test('normalises en dashes too, so a reviewer sees no stray dash characters', () => {
		expect(toSummary('The 2024–2025 shift changed how enterprises govern their agents.', 200)).toBe(
			'The 2024 - 2025 shift changed how enterprises govern their agents.'
		);
	});

	test('does not mangle a dash inside a URL, because the URL is already gone', () => {
		expect(toSummary('Read the write-up https://example.com/a—b/c for the full detail.', 200)).toBe(
			'Read the write-up for the full detail.'
		);
	});

	test('leaves no dangling hyphen when the budget cuts at a normalised dash', () => {
		expect(
			toSummary('Securing the realm of agents — confidentiality and integrity matter here.', 40)
		).toBe('Securing the realm of agents…');
	});
});

describe('toTitle', () => {
	test('drops the trailing hashtag run', () => {
		expect(toTitle('Agentic AI - Quickfire with Kevin McDonnell #ai #agents')).toBe(
			'Agentic AI - Quickfire with Kevin McDonnell'
		);
	});

	test('keeps a title that is nothing but hashtags', () => {
		expect(toTitle('#shorts')).toBe('#shorts');
	});
});
