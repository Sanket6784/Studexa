import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Technerva — The Engineering Student Network",
    template: "%s | Technerva",
  },
  description:
    "Build your engineering identity, showcase projects, publish blogs, discover talented students and grow your professional network with Technerva.",
  applicationName: "Technerva",
  keywords: [
    "Technerva",
    "engineering students",
    "engineering student network",
    "student portfolio",
    "engineering projects",
    "engineering blogs",
    "student community",
  ],
  authors: [{ name: "Technerva" }],
  creator: "Technerva",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://studexa-indol.vercel.app"
  ),
  openGraph: {
    title: "Technerva — The Engineering Student Network",
    description:
      "Build. Share. Connect. Grow with the network built for the next generation of engineers.",
    siteName: "Technerva",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
