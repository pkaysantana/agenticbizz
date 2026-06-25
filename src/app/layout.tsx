import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutLab | Agentic Video Optimisation",
  description:
    "A self-running short-form video growth workflow with simulation, safety gates, and monetisable export.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
