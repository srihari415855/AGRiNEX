import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppProvider } from "@/lib/AppContext";
import { Toaster } from "@/components/ui/sonner";
import LanguageAutoTranslator from "@/components/LanguageAutoTranslator";

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
          <LanguageAutoTranslator />
          {children}
        </AppProvider>

        {/* Global Google Translate Initialization */}
        <Script id="google-translate-element-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              if (window.google && window.google.translate) {
                new window.google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,hi,kn',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            }
          `}
        </Script>
        <Script
          id="google-translate-script"
          strategy="afterInteractive"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        />
      </body>
    </html>
  );
}
