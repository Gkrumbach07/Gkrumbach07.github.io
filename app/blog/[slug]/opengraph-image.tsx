import { ImageResponse } from "next/og"
import { getPostBySlug } from "@/lib/blog"

export const runtime = "nodejs"

export const alt = "Blog post"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  const title = post?.title || "Blog Post"
  const excerpt = post?.excerpt || ""

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "60px",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontFamily: "monospace",
              color: "#22c55e",
            }}
          >
            {">"} ~/blog
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 50 ? "48px" : "56px",
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: "-1px",
              lineHeight: 1.2,
              marginBottom: "24px",
            }}
          >
            {title}
          </div>

          {excerpt && (
            <div
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                lineHeight: 1.4,
                maxWidth: "900px",
              }}
            >
              {excerpt.length > 150 ? `${excerpt.slice(0, 150)}...` : excerpt}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #27272a",
            paddingTop: "24px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              color: "#ffffff",
              fontWeight: "600",
            }}
          >
            Gage Krumbach
          </div>
          <div
            style={{
              fontSize: "20px",
              color: "#71717a",
            }}
          >
            gagekrumbach.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

