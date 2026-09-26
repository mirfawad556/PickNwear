"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 leading-[1.1]">
          ✨Dress like you&apos;re already famous✨
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-10 font-medium tracking-wide">
          Style | Quality | Elegance
        </p>
        
        <Link href="/collections" passHref>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-black text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-zinc-800 transition-colors shadow-lg shadow-black/20"
          >
            Shop Collection
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
