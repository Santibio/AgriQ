import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./providers";
import Header from "./_header";
import moment from "moment";
import "moment/locale/es";
import NavBar from "./_navbar";

moment.locale("es");

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "AgriQ",
  description: "Un aplicacion mobile para dar seguimiento a productos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased `}
      >
        <Providers>
          <Header />
          <main className="max-w-[600px] m-auto  pt-4">{children}</main>
          <NavBar />
        </Providers>
      </body>
    </html>
  );
}
