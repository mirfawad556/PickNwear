"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

type Variant = {
  id: string;
  name: string;
  description: React.ReactNode;
  price: number;
  image: string;
};

type Collection = {
  id: string;
  name: string;
  description: React.ReactNode;
  price: number;
  image: string;
  variants: Variant[];
};

const premiumDesc = "Less is more. Elevate your everyday style with our Premium Drop Shoulder T-Shirts—designed for ultimate comfort and a modern oversized fit. ✨ Premium Fabric 👌 Relaxed Drop Shoulder Fit 🎯 Minimal • Stylish • Everyday Essential 📏 Available in Multiple Sizes and colours";
const eidDesc = "𝐂𝐞𝐥𝐞𝐛𝐫𝐚𝐭𝐞 𝐄𝐢𝐝 𝐢𝐧 𝐩𝐮𝐫𝐞 𝐥𝐮𝐱𝐮𝐫𝐲 💃𝐝𝐫𝐞𝐬𝐬𝐞𝐬 𝐛𝐥𝐞𝐧𝐝𝐞𝐝 𝐰𝐢𝐭𝐡 𝐜𝐫𝐚𝐟𝐭𝐬𝐦𝐚𝐧𝐬𝐡𝐢𝐩 – 𝐞𝐥𝐞𝐯𝐚𝐭𝐞 𝐲𝐨𝐮𝐫 𝐄𝐢𝐝 𝐥𝐨𝐨𝐤. 𝐋𝐢𝐦𝐢𝐭𝐞𝐝 𝐩𝐢𝐞𝐜𝐞𝐬";

const velvetDesc = (
  <span className="flex flex-col gap-2 mt-1">
    <span className="uppercase text-[10px] font-bold tracking-widest text-indigo-500">Most trending article</span>
    <span>✨ <strong className="font-semibold text-gray-900">Heavy fabric</strong></span>
    <span>❄️ With <strong className="font-semibold text-gray-900">extra warmth & comfort</strong></span>
    <span className="italic font-medium text-gray-800 mt-1">Best quality. Best price.</span>
  </span>
);

const collections: Collection[] = [
  {
    id: "col-1",
    name: "Forest Green Drop Shoulder",
    description: premiumDesc,
    price: 899,
    image: "/product1.jpg",
    variants: [
      {
        id: "1",
        name: "Forest Green Drop Shoulder",
        description: premiumDesc,
        price: 899,
        image: "/product1.jpg"
      },
      {
        id: "2",
        name: "Classic White Drop Shoulder",
        description: premiumDesc,
        price: 899,
        image: "/product2.png"
      },
      {
        id: "3",
        name: "Premium Essential Colors",
        description: premiumDesc,
        price: 899,
        image: "/product3.jpg"
      }
    ]
  },
  {
    id: "col-2",
    name: "Luxury Eid Dress",
    description: eidDesc,
    price: 1999,
    image: "/eid1.jpg",
    variants: [
      {
        id: "eid-1",
        name: "Luxury Eid Dress (Front)",
        description: eidDesc,
        price: 1999,
        image: "/eid1.jpg"
      },
      {
        id: "eid-2",
        name: "Luxury Eid Dress (Side)",
        description: eidDesc,
        price: 1999,
        image: "/eid2.jpg"
      }
    ]
  },
  {
    id: "col-3",
    name: "Marble Crush Velvet Pherans",
    description: velvetDesc,
    price: 2500,
    image: "/velvet.jpg",
    variants: [
      {
        id: "velvet-1",
        name: "Marble Crush Velvet Pherans",
        description: velvetDesc,
        price: 2500,
        image: "/velvet.jpg"
      }
    ]
  }
];

export default function ProductGrid() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeColIndex, setActiveColIndex] = useState<number | null>(null);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const { addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  // Simulate network load only on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeColIndex !== null && activeVariantIndex < collections[activeColIndex].variants.length - 1) {
      setActiveVariantIndex(activeVariantIndex + 1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeColIndex !== null && activeVariantIndex > 0) {
      setActiveVariantIndex(activeVariantIndex - 1);
    }
  };

  const openModal = (index: number) => {
    setActiveColIndex(index);
    setActiveVariantIndex(0);
  };

  const closeModal = () => {
    setActiveColIndex(null);
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (activeColIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [activeColIndex]);

  const activeCollection = activeColIndex !== null ? collections[activeColIndex] : null;
  const activeVariant = activeCollection ? activeCollection.variants[activeVariantIndex] : null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-24" id="shop">
      {/* Inner Header / Section Title matching UI */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 text-sm font-medium text-gray-500">
        <span className="text-gray-900">Featured Collections</span>
        <div className="flex gap-4">
          <button className="hover:text-black transition-colors">Information</button>
          <button className="hover:text-black transition-colors">Contact</button>
        </div>
      </div>

      {/* Auto-playing Highlights Carousel (Pause on Hover) */}
      <div className="w-full overflow-hidden bg-gray-50 py-3 mb-10 rounded-sm border border-gray-100 group flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 15, repeat: Infinity }}
          className="flex whitespace-nowrap gap-8 px-4 items-center group-hover:[animation-play-state:paused]"
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-sm font-medium text-gray-800 tracking-wide">✨ New Arrivals: Marble Crush Velvet</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mx-4" />
              <span className="text-sm font-medium text-gray-800 tracking-wide">🛍️ Limited Eid Collection Live</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mx-4" />
              <span className="text-sm font-medium text-gray-800 tracking-wide">⚡ Free Shipping on Premium Drops</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mx-4" />
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* Kept grid-cols-3 setup to preserve exact same styling and visual design, even with 2 items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <ProductSkeleton key={i} />)
          : collections.map((col, i) => (
              <ProductCard 
                key={col.id} 
                collection={col} 
                index={i} 
                onClick={() => openModal(i)}
              />
            ))}
      </div>

      {/* Promotional Details Beneath Grid */}
      <div className="mt-16 pt-12 border-t border-gray-200 text-center max-w-4xl mx-auto flex flex-col items-center justify-center">
        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Rs. 1999</h3>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl">
          {eidDesc}
        </p>
      </div>

      {/* Modal Carousel */}
      <AnimatePresence>
        {activeColIndex !== null && activeVariant !== null && activeCollection !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
            onClick={closeModal}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row relative shadow-2xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Close Button */}
              <button 
                onClick={closeModal} 
                className="absolute top-4 right-4 z-20 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={24} className="text-gray-700" />
              </button>

              {/* Left Side: Carousel Image Area */}
              <div className="relative w-full md:w-1/2 aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVariant.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeVariant.image}
                      alt={activeVariant.name}
                      fill
                      className="object-cover object-top"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                {activeVariantIndex > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-black shadow-lg rounded-full transition-transform hover:scale-110 z-10"
                    aria-label="Previous product"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {activeVariantIndex < activeCollection.variants.length - 1 && (
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-black shadow-lg rounded-full transition-transform hover:scale-110 z-10"
                    aria-label="Next product"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </div>

              {/* Right Side: Product Details */}
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white overflow-y-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeVariant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                  >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                      {activeVariant.name}
                    </h2>
                    <p className="text-2xl font-semibold text-gray-700 mb-8">
                      ₹{activeVariant.price}
                    </p>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-10 text-sm md:text-base">
                      {activeVariant.description}
                    </p>
                    <button 
                      onClick={async () => {
                        if (!user) {
                          openAuthModal('login');
                        } else {
                          await addToCart(activeVariant);
                          closeModal();
                        }
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-full transition-colors shadow-lg shadow-red-600/20"
                    >
                      Add to Cart
                    </button>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ProductCard({ 
  collection, 
  index, 
  onClick
}: { 
  collection: Collection; 
  index: number; 
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] mb-6 overflow-hidden bg-gray-100 rounded-sm group-hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-shadow duration-500">
        <Image
          src={collection.image}
          alt={collection.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900">{collection.name}</h3>
        <span className="text-gray-700 font-semibold text-lg">₹{collection.price}</span>
      </div>
      
      <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
        {collection.description}
      </p>
    </motion.div>
  );
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse flex flex-col">
      <div className="relative aspect-[4/5] mb-6 bg-gray-200 rounded-sm w-full"></div>
      <div className="flex justify-between items-start mb-3 w-full gap-4">
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
      <div className="space-y-2 mt-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}
