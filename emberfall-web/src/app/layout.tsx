import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Emberfall: Ash of the Oath",
  description:
    "Cross-platform web build of Emberfall for iPhone and Android via Vercel deployment."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
