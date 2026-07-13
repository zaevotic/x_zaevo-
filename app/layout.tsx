import type { Metadata } from "next";
import { JetBrains_Mono, Inter, Pirata_One } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";

/*
 * next/font/google downloads all font files at build time and serves them
 * from /_next/static/media/ — zero runtime requests to Google's servers.
 */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const pirataOne = Pirata_One({
  variable: "--font-pirata-one",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "zaevo — void",
  description:
    "Portfolio of zaevo — engineering student building things at the intersection of systems, security, and developer tooling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${inter.variable} ${pirataOne.variable} h-full`}
    >
      <body className="h-full">
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
