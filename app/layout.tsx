import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eric Family Tracker",
  description: "A private family relationship tracker with a humorous leaderboard, photo race graph, flexible photo picker, and suspiciously specific family lore."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
