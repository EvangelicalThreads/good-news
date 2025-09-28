// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "../components/AuthProvider";
import BottomNavWrapper from "../components/BottomNav";
import Header from "../components/Header";
import { UserProvider } from "@/context/UserContext"; // ✅ wrap everything needing user context
import "./globals.css";
import "./layout.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Good News App",
  description: "Daily devotional and reflections app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased layoutBody bg-white text-gray-900`}
      >
        <AuthProvider>
          <UserProvider>
            <Header />
            <main className="layoutMain">{children}</main>
            <BottomNavWrapper />
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
