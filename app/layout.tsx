import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://calltioeric.com"),
  title: {
    default: "Tio Eric Family Tracker",
    template: "%s | Tio Eric Family Tracker"
  },
  description:
    "The private leaderboard where calls, texts, and emotional receipts become a Tio Eric Aura Index.",
  applicationName: "Tio Eric Family Tracker",
  appleWebApp: {
    title: "Tio Eric"
  },
  openGraph: {
    title: "Tio Eric Family Tracker",
    description:
      "A private dashboard showing who really cares about me and who does not. Love is real, math is weaponized.",
    url: "https://calltioeric.com",
    siteName: "Tio Eric Family Tracker",
    images: [
      {
        url: "https://calltioeric.com/share-card.jpg",
        width: 600,
        height: 315,
        alt: "Tio Eric Family Tracker leaderboard preview",
        type: "image/jpeg"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Tio Eric Family Tracker",
    description:
      "A private dashboard showing who really cares about me and who does not.",
    images: ["https://calltioeric.com/share-card.jpg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
