# Portfolio Website

A modern, developer-focused portfolio website built with Next.js, featuring dynamic GitHub integration for projects and blog posts.

## Features

- **GitHub-Powered Blog**: Blog posts stored as markdown files in a GitHub repository with frontmatter metadata
- **Dynamic Projects**: Automatically fetches and displays GitHub repositories
- **Recent Activity**: Shows your latest GitHub activity
- **Dark Mode**: Full dark mode support with theme switching
- **Responsive Design**: Mobile-first, responsive layout
- **Terminal Aesthetic**: Developer-friendly UI with terminal-inspired elements
- **Interactive Components**: Animated landscape scene, sundial, backpacking map, and more

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A GitHub account and personal access token
- A GitHub repository for storing blog posts (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (see Configuration section below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view your portfolio

## Configuration

Create a `.env.local` file in the root directory:

```bash
# GitHub Personal Access Token (create at: https://github.com/settings/tokens)
GITHUB_TOKEN=ghp_your_token_here

# Your GitHub username
GITHUB_USERNAME=your_username
NEXT_PUBLIC_GITHUB_USERNAME=your_username

# Blog repository (format: username/repo-name)
GITHUB_BLOG_REPO=your_username/blog
GITHUB_BLOG_BRANCH=main
GITHUB_BLOG_PATH=posts
```

### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
4. Copy the token and add it to `.env.local`

## Blog Setup

Blog posts are stored in the `content/posts/` directory of this repository.

### Quick Start

1. **Example posts are already included!** Check `content/posts/` for examples

2. **Create new posts** using the template:

```bash
cp BLOG_POST_TEMPLATE.md content/posts/my-new-post.md
```

3. **Add frontmatter** at the top of each post:

```markdown
---
title: "My First Post"
excerpt: "A brief description"
date: "2025-01-04"
pinned: true
tags: ["javascript", "react"]
---

# Your content here...
```

4. **Commit and push** to GitHub:

```bash
git add content/posts/my-new-post.md
git commit -m "Add new blog post"
git push
```

See [BLOG_SETUP.md](./BLOG_SETUP.md) for detailed instructions.

## Project Structure

```
portfolio/
├── app/                    # Next.js app directory
│   ├── blog/              # Blog pages
│   ├── projects/          # Projects page
│   └── about/             # About page
├── components/            # React components
├── content/               # Blog content
│   └── posts/            # Blog post markdown files
├── lib/                   # Utility functions
│   ├── blog.ts           # Blog post fetching
│   ├── github-blog.ts    # GitHub API integration
│   ├── github.ts         # GitHub repos/activity
│   └── markdown.ts       # Markdown rendering
└── public/               # Static assets
```

## Key Components

- **Hero Section**: Animated introduction with terminal prompt
- **Landscape Scene**: Interactive SVG landscape with parallax
- **Sundial**: Real-time sundial based on your location
- **Recent Activity**: GitHub activity feed
- **Featured Projects**: Highlighted GitHub repositories
- **Blog**: Markdown-powered blog with GitHub backend

## Technologies Used

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Animations**: React Spring
- **Markdown**: gray-matter, remark
- **Icons**: Lucide React
- **Maps**: Mapbox GL

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

### Other Platforms

The project can be deployed to any platform that supports Next.js:

```bash
npm run build
npm start
```

## Customization

- Update personal information in components
- Modify color scheme in `app/globals.css`
- Customize components in `components/`
- Add/remove sections in `app/page.tsx`

## License

MIT License - feel free to use this template for your own portfolio!

## Credits

Built with [Next.js](https://nextjs.org), deployed on [Vercel](https://vercel.com)
