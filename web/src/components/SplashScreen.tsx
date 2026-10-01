"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";

type SequenceState = "loading" | "popup" | "complete";

export default function SplashScreen() {
  const [sequence, setSequence] = useState<SequenceState>("complete"); // Default to complete to prevent hydration mismatch flashes

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("splashSeen");
    if (hasSeenSplash) {
      setSequence("complete");
    } else {
      setSequence("loading");
      // 1. Logo loading sequence finishes after 2.5s
      const timer = setTimeout(() => {
        setSequence("popup");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismissPopup = () => {
    sessionStorage.setItem("splashSeen", "true");
    setSequence("complete");
  };

  if (sequence === "complete") return null;

  return (
    <AnimatePresence mode="wait">
      {/* STAGE 1: LOADING SCREEN WITH LOGO */}
      {sequence === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", type: "spring" }}
            className="relative flex flex-col items-center justify-center"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ filter: "blur(8px)", opacity: 0 }}
                animate={{ filter: "blur(0px)", opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-2 border-black z-10"
              >
                <Image src="/logo.jpg" alt="PickNwear" fill className="object-cover" priority />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, rotate: -20, x: -10, y: -10 }}
                animate={{ opacity: 1, rotate: [10, -10, 5, -5, 0], x: 0, y: 0 }}
                transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                className="absolute -right-6 -top-4 z-20 text-black bg-white p-2 rounded-full shadow-lg border border-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </motion.div>
            </div>
            
            <div className="relative mt-6">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-2xl font-bold tracking-tight text-black relative z-10"
              >
                PickNwear
              </motion.h1>
              <motion.div
                initial={{ width: "0%", left: "0%", opacity: 0 }}
                animate={{ width: ["0%", "100%", "20%"], left: ["0%", "0%", "80%"], opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
                className="absolute -bottom-2 h-[2px] bg-black rounded-full"
              />
            </div>

            <motion.div className="mt-8 h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-black rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {/* STAGE 2: POST-LOADING POP-UP */}
      {sequence === "popup" && (
        <motion.div
          key="popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center relative border border-gray-100"
            role="dialog"
            aria-modal="true"
          >
            <button 
              onClick={handleDismissPopup}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-black"
              aria-label="Close popup"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-black mb-4">Exclusive Early Access</h2>
            <p className="text-gray-600 mb-8">
              Be the first to explore our new limited-edition curated pieces. Use code <strong>WELCOME10</strong> at checkout for 10% off your first order!
            </p>
            <button 
              onClick={handleDismissPopup}
              className="w-full bg-black text-white font-semibold py-4 rounded-full hover:bg-zinc-800 transition-colors"
            >
              Start Shopping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
