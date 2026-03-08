import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";

const fontUi = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
});

const fontDisplay = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
});

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
      <body className={`${fontUi.variable} ${fontDisplay.variable}`}>{children}</body>
    </html>
  );
}
