import type { Metadata } from "next";
import { JetBrains_Mono, Inter, Pirata_One } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "zaevo - void",
  description:
    "user.exe with a pinch of tiles",
  icons: {
    icon: [
      { url: "/zaevo-logo.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#b6182b",
          colorBackground: "#120d0c",
          colorForeground: "#d9d2c4",
          colorMutedForeground: "#7a736a",
          colorInput: "#0a0908",
          colorInputForeground: "#d9d2c4",
          colorNeutral: "#d9d2c4",
          colorBorder: "#2b1414",
          borderRadius: "2px",
          fontFamily: "var(--font-jetbrains-mono), monospace",
        },
        elements: {
          card: {
            backgroundColor: "#120d0c",
            border: "1px solid #2b1414",
            borderRadius: "2px",
          },
          socialButtonsBlockButton: {
            backgroundColor: "#161010",
            border: "1px solid #4a1a1f",
            color: "#d9d2c4",
            borderRadius: "2px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "12px",
          },
          socialButtonsBlockButtonText: {
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "12px",
            color: "#d9d2c4",
          },
          formButtonPrimary: {
            backgroundColor: "#3d1f18",
            border: "1px solid #b6182b",
            color: "#ff2436",
            borderRadius: "2px",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: "12px",
            letterSpacing: "0.8px",
          },
          headerTitle: {
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "#d9d2c4",
            letterSpacing: "1px",
            fontSize: "15px",
          },
          headerSubtitle: {
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "#7a736a",
            fontSize: "11px",
          },
          dividerLine: {
            backgroundColor: "#2b1414",
          },
          dividerText: {
            fontFamily: "var(--font-jetbrains-mono), monospace",
            color: "#4a453f",
            fontSize: "10px",
          },
          footerActionLink: {
            color: "#b6182b",
          },
        },
      }}
    >
      <html
        lang="en"
        className={`${jetbrainsMono.variable} ${inter.variable} ${pirataOne.variable} h-full`}
      >
        <body className="h-full">
          <CustomCursor />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
