import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";
import "./demo-chat.css";
import "./demo-gallery.css";

export const metadata: Metadata = {
  title: "BotFoundry — Chatbot Studio",
  description: "Build and train helpful chatbots for every business.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <a className="global-demo-access" href="/demos"><span>✦</span> Demo gallery</a>
        {children}
      </body>
    </html>
  );
}

