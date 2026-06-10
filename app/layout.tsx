import type { Metadata } from "next";
import "./globals.css";
import "./css/all.min.css";
import "./style.css";
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';


export const metadata: Metadata = {
  title: "Bulalo.in",
  description: "Find local businesses and services near you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
