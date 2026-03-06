import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CMG Music Box",
  description: "Game-focused Suno workflow for cue planning, prompt building, and manual generation handoff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

