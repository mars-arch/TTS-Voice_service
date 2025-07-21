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
  title: "Voice Clone",
  description: "Clone a voice and generate audio with it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}>
        <header className="border-b border-gray-700">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">Voice Clone</h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
