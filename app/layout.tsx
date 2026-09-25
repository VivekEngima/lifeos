import type { Metadata } from "next";
import "./globals.css";
import { LifeOSProvider } from "@/context/LifeOSContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuickAddModal from "@/components/QuickAddModal";

export const metadata: Metadata = {
  title: "LifeOS v2.5 — Command Protocol & Daily Ledger",
  description:
    "Personal operating system, habit streaks, deep work ledger, and life horizon telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface antialiased min-h-screen">
        <LifeOSProvider>
          <Navigation />
          <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
            {children}
          </main>
          <QuickAddModal />
          <Footer />
        </LifeOSProvider>
      </body>
    </html>
  );
}
