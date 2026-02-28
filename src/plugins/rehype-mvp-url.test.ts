import { describe, it, expect } from "bun:test";
import type { Root, Element } from "hast";
import rehypeMvpUrl, { MVP_IDS, processHref } from "./rehype-mvp-url";

// Helper: build a minimal hast tree with a single <a> element
function makeTree(href: string): Root {
	return {
		type: "root",
		children: [
			{
				type: "element",
				tagName: "a",
				properties: { href },
				children: [{ type: "text", value: "link" }],
			},
		],
	};
}

function getHref(tree: Root): string {
	const anchor = tree.children[0] as Element;
	return anchor.properties.href as string;
}

describe("processHref", () => {
	it("adds WT.mc_id to a bare Microsoft URL", () => {
		const result = processHref("https://learn.microsoft.com/en-us/azure/");
		const url = new URL(result);
		expect(url.searchParams.get("WT.mc_id")).not.toBeNull();
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
	});

	it("replaces existing WT.mc_id", () => {
		const result = processHref(
			"https://learn.microsoft.com/path?WT.mc_id=AI-MVP-5004204",
		);
		const url = new URL(result);
		// Should have exactly one WT.mc_id and it should be a valid MVP ID
		const values = url.searchParams.getAll("WT.mc_id");
		expect(values).toHaveLength(1);
		expect(MVP_IDS).toContain(values[0]);
	});

	it("replaces lowercase wt.mc_id (case-insensitive)", () => {
		const result = processHref(
			"https://learn.microsoft.com/path?wt.mc_id=OLD_VALUE",
		);
		const url = new URL(result);
		// The old lowercase key should be gone, replaced by WT.mc_id
		expect(url.searchParams.get("WT.mc_id")).not.toBeNull();
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
		// Ensure old value is gone
		expect(url.searchParams.has("wt.mc_id")).toBe(false);
	});

	it("preserves other query params while adding WT.mc_id", () => {
		const result = processHref(
			"https://learn.microsoft.com/path?tab=foo",
		);
		const url = new URL(result);
		expect(url.searchParams.get("tab")).toBe("foo");
		expect(url.searchParams.get("WT.mc_id")).not.toBeNull();
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
	});

	it("preserves other params and replaces WT.mc_id when both exist", () => {
		const result = processHref(
			"https://learn.microsoft.com/path?tab=foo&WT.mc_id=old",
		);
		const url = new URL(result);
		expect(url.searchParams.get("tab")).toBe("foo");
		expect(url.searchParams.get("WT.mc_id")).not.toBeNull();
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
	});

	it("leaves non-Microsoft URLs untouched", () => {
		const original = "https://example.com/path?key=value";
		expect(processHref(original)).toBe(original);
	});

	it("leaves relative / invalid URLs untouched", () => {
		expect(processHref("/relative/path")).toBe("/relative/path");
		expect(processHref("not-a-url")).toBe("not-a-url");
	});

	it("handles microsoft.com root domain", () => {
		const result = processHref("https://microsoft.com/something");
		const url = new URL(result);
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
	});
});

describe("determinism", () => {
	it("returns the same result for the same URL every time", () => {
		const input = "https://learn.microsoft.com/en-us/azure/ai-services";
		const first = processHref(input);
		for (let i = 0; i < 50; i++) {
			expect(processHref(input)).toBe(first);
		}
	});
});

describe("distribution", () => {
	it("assigns both MVP IDs across 100+ distinct paths with ≥30% each", () => {
		const counts: Record<string, number> = {};
		for (const id of MVP_IDS) {
			counts[id] = 0;
		}

		const totalPaths = 200;
		for (let i = 0; i < totalPaths; i++) {
			const result = processHref(
				`https://learn.microsoft.com/path-${i}/page`,
			);
			const url = new URL(result);
			const id = url.searchParams.get("WT.mc_id")!;
			counts[id]++;
		}

		for (const id of MVP_IDS) {
			const pct = counts[id] / totalPaths;
			expect(pct).toBeGreaterThanOrEqual(0.3);
			expect(pct).toBeLessThanOrEqual(0.7);
		}
	});
});

describe("rehypeMvpUrl (tree transformer)", () => {
	it("transforms Microsoft URLs in <a> elements", () => {
		const tree = makeTree("https://learn.microsoft.com/en-us/azure/");
		const transform = rehypeMvpUrl();
		transform(tree);
		const href = getHref(tree);
		const url = new URL(href);
		expect(MVP_IDS).toContain(url.searchParams.get("WT.mc_id")!);
	});

	it("skips non-<a> elements", () => {
		const tree: Root = {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "div",
					properties: { href: "https://learn.microsoft.com/" },
					children: [],
				},
			],
		};
		const transform = rehypeMvpUrl();
		transform(tree);
		const div = tree.children[0] as Element;
		expect(div.properties.href).toBe("https://learn.microsoft.com/");
	});

	it("skips <a> elements without href", () => {
		const tree: Root = {
			type: "root",
			children: [
				{
					type: "element",
					tagName: "a",
					properties: { id: "anchor" },
					children: [],
				},
			],
		};
		const transform = rehypeMvpUrl();
		transform(tree);
		const anchor = tree.children[0] as Element;
		expect(anchor.properties.href).toBeUndefined();
	});

	it("leaves non-Microsoft links alone in tree", () => {
		const original = "https://github.com/example/repo";
		const tree = makeTree(original);
		const transform = rehypeMvpUrl();
		transform(tree);
		expect(getHref(tree)).toBe(original);
	});
});
