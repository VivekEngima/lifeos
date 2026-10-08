import type { Metadata } from "next";
import "./globals.css";
import { LifeOSProvider } from "@/context/LifeOSContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import QuickAddModal from "@/components/QuickAddModal";
import BookReadingModal from "@/components/BookReadingModal";
import EditItemModal from "@/components/EditItemModal";
import NotificationToast from "@/components/NotificationToast";
import GlobalLoader from "@/components/GlobalLoader";
import AuthGuard from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "LifeOS v2.5 — Command Protocol & Daily Ledger",
  description:
    "LifeOS habit streaks, deep work ledger, and life horizon telemetry.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container/20 selection:text-primary">
        <LifeOSProvider>
          <AuthGuard>
            <Navigation />
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
              {children}
            </main>
            <QuickAddModal />
            <BookReadingModal />
            <EditItemModal />
            <NotificationToast />
            <GlobalLoader />
            <Footer />
          </AuthGuard>
        </LifeOSProvider>
      </body>
    </html>
  );
}

