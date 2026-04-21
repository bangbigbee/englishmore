import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import TopNav from "@/components/TopNav";
import MainWrapper from "@/components/MainWrapper";
import { Toaster } from "sonner";
import LoginModalController from "./LoginModalController";
import GlobalUpgradePoller from "@/components/GlobalUpgradePoller";
import ToeicMoreNotice from "@/components/ToeicMoreNotice";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await import("next/headers").then(m => m.headers());
  const host = headersList.get('host') || '';
  const isToeicDomain = host.includes('toeicmore');

  if (isToeicDomain) {
    return {
      title: "ToeicMore - Luyện TOEIC nhanh và hiệu quả hơn",
      description: "Hệ thống luyện thi TOEIC thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao nhất dành cho bạn.",
      openGraph: {
        title: "ToeicMore - Luyện TOEIC nhanh và hiệu quả hơn",
        description: "Hệ thống luyện thi TOEIC thực chiến, hỗ trợ sát sao, và mang lại hiệu quả cao nhất dành cho bạn.",
        url: "https://toeicmore.com",
        siteName: "ToeicMore",
        images: [
          {
            url: "/toeicmorelogo.svg",
            width: 800,
            height: 600,
            alt: "ToeicMore Logo",
          },
        ],
        locale: "vi_VN",
        type: "website",
      },
      icons: {
        icon: '/toeicmoreicon.svg',
      },
      metadataBase: new URL('https://toeicmore.com'),
    };
  }

  return {
    title: "EnglishMore - English Learning Platform",
    description: "A learning platform for course registration, assignments, and study progress.",
    openGraph: {
      title: "EnglishMore - English Learning Platform",
      description: "A learning platform for course registration, assignments, and study progress.",
      url: "https://englishmore.bigbee.ltd",
      siteName: "EnglishMore",
      locale: "vi_VN",
      type: "website",
    },
    metadataBase: new URL('https://englishmore.bigbee.ltd'),
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await import("next/headers").then(m => m.headers());
  const host = headersList.get('host') || '';
  const isToeicDomain = host.includes('toeicmore');

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fdfdfc]">
        <AuthProvider>
          <TopNav isToeicDomain={isToeicDomain} />
          <MainWrapper>{children}</MainWrapper>
          <LoginModalController />
          <GlobalUpgradePoller />
          <ToeicMoreNotice />
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
