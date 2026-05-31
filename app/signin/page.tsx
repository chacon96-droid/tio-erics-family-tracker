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
        url: "https://calltioeric.com/share-card.jpg",
        width: 600,
        height: 315,
        alt: "Tio Eric Family Tracker leaderboard preview",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Tio Eric Family Tracker",
    description:
      "This dashboard shows who really cares about me and who does not.",
    images: ["https://calltioeric.com/share-card.jpg"]
  }
};

export default LoginPage;
