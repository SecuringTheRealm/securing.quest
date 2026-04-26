import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).default([]),
		draft: z.boolean().default(false),
	}),
});

const talks = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/talks' }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		event: z.string(),
		videoUrl: z.string().url().optional(),
		slidesUrl: z.string().url().optional(),
		eventUrl: z.string().url().optional(),
		summary: z.string(),
		tags: z.array(z.string()).default([]),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/projects' }),
	schema: z.object({
		name: z.string(),
		description: z.string(),
		repoUrl: z.string().url(),
		tech: z.array(z.string()).default([]),
		status: z.enum(['active', 'archived', 'experimental']).default('active'),
		firstPublic: z.coerce.date().optional(),
	}),
});

const shorts = defineCollection({
	loader: glob({ pattern: '**/*.json', base: './src/content/shorts' }),
	schema: z.object({
		youtubeId: z.string(),
		title: z.string().optional(),
		relatedContent: z
			.array(
				z.object({
					type: z.enum(['blog', 'talk', 'project', 'external']),
					slug: z.string(),
					title: z.string().optional(),
				})
			)
			.optional(),
		tags: z.array(z.string()).optional(),
	}),
});

export const collections = {
	blog,
	talks,
	projects,
	shorts,
};
