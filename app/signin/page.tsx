import type { Metadata } from "next";
import LoginPage from "../login/page";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "The Tio Eric dashboard showing who really cares about me and who does not.",
  alternates: {
    canonical: "/signin"
  },
  openGraph: {
    title: "Tio Eric Family Tracker",
    description:
      "This dashboard shows who really cares about me and who does not.",
    url: "https://calltioeric.com/signin",
    images: [
      {
        url: "https://calltioeric.com/share-card.png",
        width: 1200,
        height: 630,
        alt: "Tio Eric Family Tracker leaderboard preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Tio Eric Family Tracker",
    description:
      "This dashboard shows who really cares about me and who does not.",
    images: ["https://calltioeric.com/share-card.png"]
  }
};

export default LoginPage;
