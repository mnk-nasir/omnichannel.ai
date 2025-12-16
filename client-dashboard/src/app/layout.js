import { Inter } from "next/font/google";
import "./globals.css";
import { ComplianceBanner } from "@/components/ComplianceBanner";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata = {
  title: "Omnixa - 24/7 AI Contact Center",
  description: "Automate Every Channel. Zero Human Slip-ups.",
  icons: {
    icon: '/omnixa-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <ComplianceBanner />
      </body>
    </html>
  );
}
