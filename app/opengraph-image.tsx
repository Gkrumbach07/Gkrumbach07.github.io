import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "Gage Krumbach - Software Engineer"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage: "radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          {/* Terminal-style decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "24px",
              fontFamily: "monospace",
              color: "#22c55e",
            }}
          >
            <span>{">"}</span>
            <span>~/gage-krumbach</span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: "-2px",
            }}
          >
            Gage Krumbach
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "32px",
              color: "#a1a1aa",
            }}
          >
            Software Engineer @ Red Hat
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["Kubernetes", "Open Source", "AI/ML"].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#1f1f23",
                  borderRadius: "6px",
                  fontSize: "20px",
                  color: "#71717a",
                  border: "1px solid #27272a",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

