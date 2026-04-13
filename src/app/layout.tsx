import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import TopNav from "@/components/TopNav";
import { Toaster } from "sonner";
import LoginModalController from "./LoginModalController";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnglishMore - English Learning Platform",
  description: "A learning platform for course registration, assignments, and study progress.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfdfc]">
        <AuthProvider>
          <TopNav />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">{children}</main>
          <LoginModalController />
          <Toaster
            richColors
            position="top-center"
            closeButton
            duration={7000}
            offset={72}
            toastOptions={{
              style: {
                maxWidth: '640px'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
