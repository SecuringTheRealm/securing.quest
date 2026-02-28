import type { Root, Element, Properties } from "hast";
import { visit } from "unist-util-visit";

const MVP_IDS: readonly string[] = ["AI-MVP-5004204", "MVP_466754"] as const;

/**
 * Simple string hash that returns a non-negative integer.
 */
function hashPathname(pathname: string): number {
	let hash = 0;
	for (let i = 0; i < pathname.length; i++) {
		hash = (hash * 31 + pathname.charCodeAt(i)) | 0;
	}
	return Math.abs(hash);
}

function isMicrosoftUrl(hostname: string): boolean {
	return (
		hostname.endsWith(".microsoft.com") || hostname === "microsoft.com"
	);
}

function processHref(href: string): string {
	let url: URL;
	try {
		url = new URL(href);
	} catch {
		return href;
	}

	if (!isMicrosoftUrl(url.hostname)) {
		return href;
	}

	// Strip existing WT.mc_id (case-insensitive)
	const keysToDelete: string[] = [];
	for (const key of url.searchParams.keys()) {
		if (key.toLowerCase() === "wt.mc_id") {
			keysToDelete.push(key);
		}
	}
	for (const key of keysToDelete) {
		url.searchParams.delete(key);
	}

	// Deterministically pick an ID from the pathname
	const index = hashPathname(url.pathname) % MVP_IDS.length;
	url.searchParams.set("WT.mc_id", MVP_IDS[index]);

	return url.toString();
}

export default function rehypeMvpUrl(): (tree: Root) => void {
	return (tree: Root): void => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "a") return;

			const props: Properties | undefined = node.properties;
			if (!props?.href || typeof props.href !== "string") return;

			props.href = processHref(props.href);
		});
	};
}

export { MVP_IDS, hashPathname, processHref };
