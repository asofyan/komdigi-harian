import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ringkasan Harian Komdigi",
  description: "Ringkasan Harian Komdigi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
