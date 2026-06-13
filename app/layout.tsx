import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cliply - Download Medal Clips Without Watermarks",
  description: "Download Medal clips without watermarks. No premium required. Download Medal clips easily from Fortnite, Valorant, Roblox and more.",
  keywords: ["Medal", "Download", "Remove", "Watermark", "Clips", "Fortnite", "Valorant", "Roblox", "Cliply"],
  authors: [{ name: "Tyson3101" }],
  openGraph: {
    title: "Cliply - Download Medal Clips Without Watermarks",
    description: "Download Medal clips without watermarks. No premium required.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliply - Download Medal Clips Without Watermarks",
    description: "Download Medal clips without watermarks. No premium required.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
