import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webapp",
  description: "Next.js SPA with OpenStreetMap",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}