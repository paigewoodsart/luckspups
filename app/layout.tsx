import type { Metadata } from "next";
import { Nunito, Anton } from "next/font/google";
import { Footer } from "@/components/Footer";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Luck's Pups | Luck's Rescue",
  description: "Animals currently in Luck's Rescue's care, kept up to date for transport partners.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${anton.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-brown">
        {children}
        <Footer />
      </body>
    </html>
  );
}
