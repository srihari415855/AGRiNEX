import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "AGRiNEX - A Digital Mirror of Your Actual Farm",
  description: "Multilingual, voice-first, AI-powered digital operating system for your farm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-stone-50 text-stone-900 antialiased selection:bg-emerald-200">
        <AppProvider>
          <Toaster position="top-right" />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
