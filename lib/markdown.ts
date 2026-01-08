import { remark } from "remark"
import html from "remark-html"
import gfm from "remark-gfm"

/**
 * Converts markdown to HTML
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(gfm) // GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)
    .use(html, { sanitize: false }) // Convert to HTML
    .process(markdown)

  return result.toString()
}

