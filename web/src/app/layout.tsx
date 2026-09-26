import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";
import CartPanel from "@/components/CartPanel";

// Use Inter for clean, minimalist typography matching the UI mockup
const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "PickNwear | Valuing Style",
  description: "E-commerce platform for PickNwear.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased text-gray-900 bg-white selection:bg-red-200 selection:text-red-900`}>
        <AuthProvider>
          <CartProvider>
            {/* Animated Logo Reveal Splash Screen */}
            <SplashScreen />
            
            {/* Autonomous Sticky Header */}
            <Header />
            
            {/* Global Auth Modal for Login/Signup */}
            <AuthModal />
            
            {/* Global Cart Slide-over Panel */}
            <CartPanel />
            
            <main className="min-h-screen">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
