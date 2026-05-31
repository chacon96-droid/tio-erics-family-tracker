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
          background: "#050607",
          color: "#f8f4e8",
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
              "radial-gradient(circle at 82% 18%, rgba(93,214,190,0.28), transparent 30%), radial-gradient(circle at 10% 92%, rgba(224,176,87,0.28), transparent 30%), linear-gradient(135deg, #050607 0%, #101516 52%, #060707 100%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.16,
            backgroundImage:
              "linear-gradient(rgba(248,244,232,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(248,244,232,0.18) 1px, transparent 1px)",
            backgroundSize: "54px 54px"
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 84,
            top: 82,
            width: 390,
            height: 466,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: 30,
            borderRadius: 36,
            background: "rgba(248,244,232,0.06)",
            border: "1px solid rgba(248,244,232,0.18)"
          }}
        >
          {[
            ["#1", "Sebastian", "92"],
            ["#2", "Briana", "88"],
            ["#3", "Zander", "74"],
            ["#4", "Luigi", "68"]
          ].map(([rank, name, score]) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "18px 20px",
                borderRadius: 24,
                background:
                  rank === "#1" ? "rgba(224,176,87,0.20)" : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(248,244,232,0.14)"
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 18,
                  background: "#070807",
                  color: rank === "#1" ? "#e0b057" : "#79d6c4",
                  fontSize: 22,
                  fontWeight: 900
                }}
              >
                {rank}
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 4 }}>
                <div style={{ fontSize: 25, fontWeight: 900 }}>{name}</div>
                <div
                  style={{
                    height: 7,
                    borderRadius: 999,
                    background: "rgba(248,244,232,0.16)",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      width: `${score}%`,
                      height: "100%",
                      borderRadius: 999,
                      background:
                        rank === "#1"
                          ? "linear-gradient(90deg, #e0b057, #79d6c4)"
                          : "linear-gradient(90deg, #79d6c4, #6c88ff)"
                    }}
                  />
                </div>
              </div>
              <div style={{ color: "#e0b057", fontSize: 24, fontWeight: 900 }}>{score}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: 76,
            top: 70,
            display: "flex",
            alignItems: "center",
            gap: 18
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              background: "#f8f4e8",
              color: "#050607",
              fontSize: 28,
              fontWeight: 950,
              letterSpacing: "-1px"
            }}
          >
            TE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div
              style={{
                color: "#e0b057",
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "7px",
                textTransform: "uppercase"
              }}
            >
              Call Tio Eric
            </div>
            <div style={{ color: "#f8f4e8", fontSize: 34, fontWeight: 900 }}>
              Family Tracker
            </div>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: 76,
            top: 198,
            width: 680,
            display: "flex",
            flexDirection: "column",
            gap: 22
          }}
        >
          <div
            style={{
              color: "#79d6c4",
              fontSize: 21,
              fontWeight: 900,
              letterSpacing: "7px",
              textTransform: "uppercase"
            }}
          >
            Tio Eric Aura Index
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 950,
              lineHeight: 0.94,
              letterSpacing: "-3px"
            }}
          >
            Yes, I pick favorites. Here they are.
          </div>
          <div
            style={{
              width: 520,
              height: 2,
              background: "linear-gradient(90deg, #e0b057, #79d6c4, transparent)"
            }}
          />
          <div
            style={{
              color: "#d7d1c2",
              fontSize: 28,
              fontWeight: 800
            }}
          >
            Calls / texts / receipts / consequences.
          </div>
        </div>
      </div>
    ),
    size
  );
}
