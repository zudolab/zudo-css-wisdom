import type { Root, Link, Definition, Node } from "mdast";
import { visit } from "unist-util-visit";
import { resolve, dirname } from "node:path";
import { buildDocsSourceMap, type DocsSourceMapOptions } from "./docs-source-map";
import { isExternal } from "./url-utils";

export interface ResolveMarkdownLinksOptions extends DocsSourceMapOptions {
  /** Behavior on broken links: 'warn' (default), 'error', 'ignore' */
  onBrokenLinks?: "warn" | "error" | "ignore";
}

/** Check if pathname has a markdown (.md / .mdx) extension. */
function hasMarkdownExtension(pathname: string): boolean {
  return /\.mdx?$/.test(pathname);
}

/** Parse a URL into pathname, search, and hash parts */
function parseUrl(url: string): {
  pathname: string;
  search: string;
  hash: string;
} {
  const hashIdx = url.indexOf("#");
  const searchIdx = url.indexOf("?");

  let pathname = url;
  let search = "";
  let hash = "";

  if (hashIdx >= 0) {
    hash = url.slice(hashIdx);
    pathname = url.slice(0, hashIdx);
  }
  if (searchIdx >= 0 && (hashIdx < 0 || searchIdx < hashIdx)) {
    search = hash ? url.slice(searchIdx, hashIdx) : url.slice(searchIdx);
    pathname = url.slice(0, searchIdx);
  }

  return { pathname, search, hash };
}

/**
 * Build candidate source-file paths for an extensionless URL.
 * Tries ".mdx" / ".md" suffixes first, then index pages for
 * directory-style links such as "./guide/".
 */
function extensionlessCandidates(basePath: string): string[] {
  return [
    `${basePath}.mdx`,
    `${basePath}.md`,
    `${basePath}/index.mdx`,
    `${basePath}/index.md`,
  ];
}

export function remarkResolveMarkdownLinks(
  options: ResolveMarkdownLinksOptions,
) {
  const onBrokenLinks = options.onBrokenLinks ?? "warn";

  return (tree: Root, file: { path?: string }) => {
    // Rebuild source map on every call so new/removed files are picked up
    // during dev server. The filesystem scan is fast (~1ms for typical doc sites).
    const sourceMap = buildDocsSourceMap(options);

    const currentFilePath = file.path;
    if (!currentFilePath) return;

    const currentDir = dirname(currentFilePath);

    visit(tree, (node: Node) => {
      if (node.type !== "link" && node.type !== "definition") return;
      const linkNode = node as Link | Definition;
      const url = linkNode.url;

      // Skip: no URL, external URLs, pure anchors
      if (!url || isExternal(url) || url.startsWith("#")) return;

      const { pathname, search, hash } = parseUrl(url);

      // Need a non-empty pathname to attempt resolution
      if (!pathname) return;

      let resolvedPath: string | null = null;
      let extensionlessLookup = false;

      if (hasMarkdownExtension(pathname)) {
        // Explicit .md / .mdx link — existing behavior, may warn on miss.
        resolvedPath = resolve(currentDir, pathname);
      } else {
        // Extensionless URL — probe likely source paths. This handles:
        //   - "./dark-mode-strategies"   → dark-mode-strategies.mdx / .md
        //   - "./0.1.0" (dotted slug)    → 0.1.0.mdx / .md
        //   - "./guide/" (dir style)     → guide/index.mdx / .md
        // If nothing matches we leave the link alone — it may legitimately
        // point at a public asset, an absolute route, or a non-doc target.
        extensionlessLookup = true;
        const basePath = resolve(currentDir, pathname);
        for (const candidate of extensionlessCandidates(basePath)) {
          if (sourceMap.has(candidate)) {
            resolvedPath = candidate;
            break;
          }
        }
        if (!resolvedPath) return;
      }

      const resolvedUrl = sourceMap.get(resolvedPath);

      if (resolvedUrl) {
        linkNode.url = resolvedUrl + search + hash;
      } else if (!extensionlessLookup) {
        // Broken link handling — only reached for explicit .md/.mdx links
        // that did not match anything in the source map.
        const fileRelative = file.path ?? "unknown";
        const message = `Broken markdown link: "${url}" in ${fileRelative} (resolved to ${resolvedPath})`;

        if (onBrokenLinks === "error") {
          throw new Error(message);
        } else if (onBrokenLinks === "warn") {
          console.warn(`[md-plugins] WARNING: ${message}`);
        }
        // 'ignore' — do nothing
      }
    });
  };
}
