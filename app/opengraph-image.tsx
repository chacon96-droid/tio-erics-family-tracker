import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tio Eric Family Tracker";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#070807",
          color: "#f7f0df",
          fontFamily: "Arial, Helvetica, sans-serif",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(210,169,92,0.24), rgba(20,151,128,0.14) 38%, rgba(7,8,7,0.94) 72%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 44,
            border: "2px solid rgba(210,169,92,0.72)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "92px 92px 82px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                width: 104,
                height: 104,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #d2a95c",
                background: "#101211",
                color: "#d2a95c",
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: "-1px"
              }}
            >
              TE
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  color: "#d2a95c",
                  fontSize: 25,
                  fontWeight: 900,
                  letterSpacing: "9px",
                  textTransform: "uppercase"
                }}
              >
                Call Tio Eric
              </div>
              <div
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: 70,
                  fontWeight: 900,
                  lineHeight: 0.9
                }}
              >
                Family Tracker
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                color: "#79c6b5",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: "8px",
                textTransform: "uppercase"
              }}
            >
              Tio Eric Aura Index
            </div>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 82,
                fontWeight: 900,
                lineHeight: 0.96,
                maxWidth: 890
              }}
            >
              Yes, I pick favorites. Here they are.
            </div>
            <div
              style={{
                display: "flex",
                gap: 18,
                color: "#efe5c7",
                fontSize: 28,
                fontWeight: 800
              }}
            >
              <span>Calls</span>
              <span style={{ color: "#d2a95c" }}>•</span>
              <span>Texts</span>
              <span style={{ color: "#d2a95c" }}>•</span>
              <span>Receipts</span>
              <span style={{ color: "#d2a95c" }}>•</span>
              <span>Consequences</span>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
