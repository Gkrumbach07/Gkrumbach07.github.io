# Blog Content

This directory contains blog posts for your portfolio website.

## How It Works

Blog posts are read **directly from this directory** - no GitHub API calls needed! 

When you run `npm run dev` or deploy, Next.js reads the markdown files from `content/posts/` at build time.

## Creating a New Blog Post

1. Create a new `.md` file in the `posts/` directory:
   ```bash
   touch content/posts/my-new-post.md
   ```

2. Add frontmatter and content:
   ```markdown
   ---
   title: "Your Post Title"
   excerpt: "Brief description"
   date: "2025-01-04"
   pinned: false
   tags: ["tag1", "tag2"]
   ---

   # Your Post Title

   Your content here...
   ```

3. That's it! The post will automatically appear on your blog.

## Frontmatter Fields

Every blog post must include frontmatter at the top:

- `title` (required): Post title
- `excerpt` (required): Short description for blog cards
- `date` (required): Publication date in YYYY-MM-DD format
- `pinned` (optional): Set to `true` to feature on homepage
- `tags` (optional): Array of tag strings
- `readingTime` (optional): Auto-calculated from word count if omitted

## File Naming

- Use lowercase letters and hyphens
- Must end in `.md` or `.mdx`
- Filename becomes the URL slug

Examples:
- `kubernetes-guide.md` → `/blog/kubernetes-guide`
- `my-coffee-setup.md` → `/blog/my-coffee-setup`

## Supported Markdown

All posts support GitHub Flavored Markdown:
- Syntax highlighting for code blocks
- Tables
- Task lists
- Strikethrough
- And more!

## Example Posts

Check out the example posts in `posts/` to see the format:
- `kubernetes-operators-deep-dive.md`
- `backpacking-gear-list.md`
- `pour-over-coffee-guide.md`

## No Build Step Required

Changes appear automatically:
- **Development**: Restart dev server to see changes
- **Production**: Redeploy to see new posts

Simple as that! ✨
