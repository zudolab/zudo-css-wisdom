import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin that transforms container directives (`:::note`, `:::info`,
 * etc., parsed by remark-directive) into JSX component nodes (`<Note>`,
 * `<Info>`, etc.) that Astro MDX resolves via the `components` prop.
 *
 * Requires remark-directive to run before this plugin.
 *
 * Usage in MDX:
 *   :::note[Custom Title]
 *   Content here.
 *   :::
 *
 *   :::note
 *   Content without custom title.
 *   :::
 */

const ADMONITION_TYPES = new Set(["note", "tip", "info", "warning", "danger"]);

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function remarkAdmonitions() {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      if (
        node.type === "containerDirective" &&
        ADMONITION_TYPES.has(node.name)
      ) {
        const componentName = capitalize(node.name);

        // Extract title from the directive label
        const label = node.children?.[0];
        const title =
          label?.data?.directiveLabel === true
            ? (label.children?.map((c: any) => c.value).join("") ?? "")
            : "";

        // Build JSX attributes
        const attributes: any[] = [];
        if (title) {
          attributes.push({
            type: "mdxJsxAttribute",
            name: "title",
            value: title,
          });
        }

        // Replace the node in-place with an mdxJsxFlowElement
        node.type = "mdxJsxFlowElement";
        node.name = componentName;
        node.attributes = attributes;

        // Remove the label paragraph from children if it was consumed as title
        if (title && label?.data?.directiveLabel === true) {
          node.children = node.children.slice(1);
        }
      }
    });
  };
}
