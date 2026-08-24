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
    default: "Studexa — Your Student Identity",
    template: "%s | Studexa",
  },
  description:
    "Build your professional student identity, showcase projects, share knowledge, discover students and grow your network with Studexa.",
  applicationName: "Studexa",
  keywords: [
    "Studexa",
    "student profile",
    "student portfolio",
    "student community",
    "projects",
    "engineering students",
  ],
  authors: [{ name: "Studexa" }],
  creator: "Studexa",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://studexa-indol.vercel.app"
  ),
  openGraph: {
    title: "Studexa — Your Student Identity",
    description: "Build your student identity beyond the resume.",
    siteName: "Studexa",
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
