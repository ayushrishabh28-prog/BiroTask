import type { Metadata } from "next";
import "./globals.css";
import "./studio.css";
import "./demo-chat.css";
import "./demo-gallery.css";
import "./tutorial-guide.css";
import "./widget.css";
import "./preview.css";
import { TutorialGuide } from "./tutorial-guide";
import { InstallWidgetHub } from "./install-widget";

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
        <TutorialGuide />
        <InstallWidgetHub />
        {children}
      </body>
    </html>
  );
}

