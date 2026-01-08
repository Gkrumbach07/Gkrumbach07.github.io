import type { BlogPost } from "@/components/blog-card"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

const postsDirectory = path.join(process.cwd(), "content/posts")

export type BlogPostWithContent = BlogPost & {
  content: string
  tags?: string[]
}

/**
 * Gets all blog posts from the content/posts directory
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  try {
    // Check if directory exists
    if (!fs.existsSync(postsDirectory)) {
      console.log("Posts directory not found:", postsDirectory)
      return []
    }

    const fileNames = fs.readdirSync(postsDirectory)
    const posts = fileNames
      .filter((fileName) => fileName.endsWith(".md") || fileName.endsWith(".mdx"))
      .map((fileName) => {
        const slug = fileName.replace(/\.(md|mdx)$/, "")
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, "utf8")
        const { data } = matter(fileContents)

        // Calculate reading time if not provided
        const content = fileContents.replace(/^---[\s\S]*?---/, "").trim()
        const words = content.split(/\s+/).length
        const readingTime = data.readingTime || `${Math.ceil(words / 200)} min read`

        return {
          slug,
          title: data.title || "Untitled",
          excerpt: data.excerpt || data.description || "",
          date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          readingTime,
          pinned: data.pinned || false,
          tags: data.tags || [],
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return posts
  } catch (error) {
    console.error("Error reading blog posts:", error)
    return []
  }
}

/**
 * Gets pinned blog posts
 */
export async function getPinnedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts()
  return posts.filter((post) => post.pinned)
}

/**
 * Gets a single blog post by slug with content
 */
export async function getPostBySlug(slug: string): Promise<BlogPostWithContent | undefined> {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`)

    let filePath: string
    if (fs.existsSync(fullPath)) {
      filePath = fullPath
    } else if (fs.existsSync(mdxPath)) {
      filePath = mdxPath
    } else {
      return undefined
    }

    const fileContents = fs.readFileSync(filePath, "utf8")
    const { data, content } = matter(fileContents)

    // Calculate reading time if not provided
    const words = content.trim().split(/\s+/).length
    const readingTime = data.readingTime || `${Math.ceil(words / 200)} min read`

    return {
      slug,
      title: data.title || "Untitled",
      excerpt: data.excerpt || data.description || "",
      date: data.date ? new Date(data.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      readingTime,
      pinned: data.pinned || false,
      tags: data.tags || [],
      content,
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return undefined
  }
}
