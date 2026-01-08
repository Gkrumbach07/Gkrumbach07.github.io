import { ContentLayout } from "@/components/content-layout"
import { ArticleSkeleton } from "@/components/skeletons/article-skeleton"

export default function BlogPostLoading() {
  return (
    <ContentLayout>
      <article className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <ArticleSkeleton />
        </div>
      </article>
    </ContentLayout>
  )
}

