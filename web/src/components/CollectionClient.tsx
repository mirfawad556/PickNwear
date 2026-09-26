"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, ChevronRight, User, Baby, Sparkles, SlidersHorizontal, ArrowUpDown, ShoppingBag } from 'lucide-react';

import { getProducts } from '@/app/actions/admin';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Forest Green Drop Shoulder', category: 'Male', price: 899, image: '/product1.jpg', tags: ['shirt', 'casual'] },
  { id: '2', name: 'Classic White Drop Shoulder', category: 'Male', price: 899, image: '/product2.png', tags: ['shirt', 'basic'] },
  { id: '3', name: 'Luxury Eid Dress', category: 'Female', price: 1999, image: '/eid1.jpg', tags: ['dress', 'luxury', 'eid'] },
  { id: '4', name: 'Marble Crush Velvet Pherans', category: 'Female', price: 2500, image: '/velvet.jpg', tags: ['velvet', 'winter'] },
  { id: '5', name: 'Premium Essential Colors', category: 'Male', price: 899, image: '/product3.jpg', tags: ['shirt', 'multi'] },
  { id: '6', name: 'Little Explorers Tee', category: 'Child', price: 599, image: '/product2.png', tags: ['kids', 'summer', 'tee'] }, // Placeholder image
  { id: '7', name: 'Elegant Floral Gown', category: 'Female', price: 2899, image: '/eid2.jpg', tags: ['gown', 'luxury', 'floral'] },
  { id: '8', name: 'Classic Washed Denim', category: 'Male', price: 1999, image: '/jeans.webp', tags: ['jeans', 'denim', 'casual'] },
  { id: '9', name: 'Earth Tone Linen Trousers', category: 'Male', price: 1499, image: '/trousers1.jpg', tags: ['trousers', 'linen'] },
  { id: '10', name: 'Pastel Striped Oxford Shirts', category: 'Male', price: 1299, image: '/polo_shirts.jpg', tags: ['shirt', 'striped', 'formal'] },
  { id: '11', name: 'Premium Cotton Trousers', category: 'Male', price: 1599, image: '/trousers2.jpg', tags: ['trousers', 'cotton'] },
  { id: '12', name: 'Classic Chino Pants', category: 'Male', price: 1499, image: '/trousers3.jpg', tags: ['trousers', 'chinos', 'basic'] },
  { id: '13', name: 'Royal Purple Velvet Pheran', category: 'Female', price: 2500, image: '/velvet_purple.jpg', tags: ['velvet', 'winter', 'pheran'] },
  { id: '14', name: 'Golden Mustard Velvet Pheran', category: 'Female', price: 2500, image: '/velvet_gold.jpg', tags: ['velvet', 'winter', 'pheran'] },
];

export default function CollectionClient() {
  const { user, openAuthModal } = useAuth();
  const { addToCart } = useCart();
  const [gender, setGender] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Initialize and check localStorage
  useEffect(() => {
    setIsMounted(true);
    
    // Fetch products from database
    const loadProducts = async () => {
      try {
        const res = await getProducts();
        if (res.success) {
          setDbProducts(res.products.map((p: any) => ({
            ...p,
            tags: [p.clothingType, ...(p.colors ? p.colors.split(',').map((c:string) => c.trim()).filter(Boolean) : [])]
          })));
        }
      } catch (err) {
        console.error("Error loading products:", err);
      }
    };
    loadProducts();

    const saved = localStorage.getItem('picknwear_gender');
    if (saved) {
      setGender(saved);
      // Simulate fetch loading
      setTimeout(() => setIsLoading(false), 1200);
    } else {
      setIsPopupOpen(true);
      setIsLoading(false);
    }
  }, []);

  const allProducts = useMemo(() => {
    return [...dbProducts, ...MOCK_PRODUCTS];
  }, [dbProducts]);

  const handleSelectGender = (g: string) => {
    setGender(g);
    localStorage.setItem('picknwear_gender', g);
    setIsPopupOpen(false);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const filteredProducts = useMemo(() => {
    if (!gender) return [];
    
    let result = allProducts.filter(p => p.category === gender);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [allProducts, gender, searchQuery, sortBy]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#faf9f6] text-zinc-900 pt-24 font-sans relative">
      
      {/* 
        ========================================================
        1. GENDER / CATEGORY SELECTION POPUP 
        ========================================================
      */}
      <AnimatePresence>
        {isPopupOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-serif text-zinc-900">Who are you shopping for?</h2>
                {gender && (
                  <button onClick={() => setIsPopupOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={20} className="text-zinc-500" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { name: 'Male', icon: User, desc: 'Premium mens essentials' },
                  { name: 'Female', icon: Sparkles, desc: 'Luxury & elegant styles' },
                  { name: 'Child', icon: Baby, desc: 'Comfortable everyday wear' }
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleSelectGender(cat.name)}
                    className="flex flex-col items-center justify-center p-8 border-2 border-zinc-100 hover:border-zinc-900 rounded-lg transition-all duration-300 hover:shadow-lg group bg-white"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4 group-hover:bg-zinc-900 group-hover:text-white transition-colors text-zinc-600">
                      <cat.icon size={28} />
                    </div>
                    <span className="text-xl font-medium mb-2 font-serif">{cat.name}</span>
                    <span className="text-xs text-zinc-500 text-center">{cat.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ========================================================
        2. DISTINCT UI/UX - COLLECTION BROWSER
        ========================================================
      */}
      <div className="max-w-[1400px] mx-auto px-6 pb-24">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs text-zinc-500 uppercase tracking-widest mb-12 pt-8">
          <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="font-semibold text-zinc-900">{gender || 'Curated Collection'}</span>
        </nav>

        {/* Header Section */}
        <div className="mb-12 border-b border-zinc-200 pb-12">
          <h1 className="text-5xl md:text-7xl font-serif text-zinc-900 mb-6">
            {gender ? `${gender}'s Curated Collection` : 'The Collection'}
          </h1>
          <p className="text-lg text-zinc-600 max-w-2xl font-serif italic">
            Discover pieces selected specifically for you. Experience a redefined shopping journey focusing on quality, elegance, and distinct style.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR FILTERS */}
          <aside className="w-full lg:w-1/4 flex flex-col gap-8">
            
            {/* Category Indicator & Changer */}
            <div className="bg-white p-6 border border-zinc-200 rounded-sm shadow-sm">
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 block">Viewing Category</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-serif font-medium">{gender || 'None'}</span>
                <button 
                  onClick={() => setIsPopupOpen(true)}
                  className="text-sm underline decoration-1 underline-offset-4 hover:text-zinc-500 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Search Functionality */}
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-3 block flex items-center gap-2">
                <Search size={14} /> Search
              </span>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search styles, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-zinc-200 focus:border-zinc-900 py-3 pl-0 pr-10 outline-none transition-colors font-serif"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 mb-3 block flex items-center gap-2">
                <ArrowUpDown size={14} /> Sort By
              </span>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'newest', label: 'New Arrivals' },
                  { id: 'price-asc', label: 'Price: Low to High' },
                  { id: 'price-desc', label: 'Price: High to Low' },
                ].map(opt => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="sort" 
                      checked={sortBy === opt.id}
                      onChange={() => setSortBy(opt.id)}
                      className="accent-zinc-900 w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${sortBy === opt.id ? 'text-zinc-900' : 'text-zinc-500 group-hover:text-zinc-900 transition-colors'}`}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="w-full lg:w-3/4">
            
            {/* Status Bar */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-sm font-medium text-zinc-500">
                {isLoading ? 'Loading...' : `Showing ${filteredProducts.length} items`}
              </span>
              <SlidersHorizontal size={20} className="text-zinc-400 lg:hidden" />
            </div>

            {/* Grid Container */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-zinc-200 mb-4 rounded-sm"></div>
                    <div className="h-4 bg-zinc-200 w-2/3 mb-2"></div>
                    <div className="h-4 bg-zinc-200 w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group cursor-pointer flex flex-col"
                    >
                      {/* Distinct Alternative Card Design */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-5 rounded-sm">
                        <Image 
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                        />
                        {/* Elegant hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black/80 to-transparent">
                          <span className="text-white text-sm uppercase tracking-widest font-semibold block">Quick View</span>
                        </div>
                      </div>
                      
                      {/* Typography Hierarchy */}
                      <h3 className="text-lg font-serif text-zinc-900 group-hover:text-zinc-500 transition-colors">{product.name}</h3>
                      <p className="text-sm text-zinc-500 mt-1 mb-2 capitalize">{product.tags.join(' • ')}</p>
                      <span className="text-lg font-medium text-zinc-900 mt-auto">₹{product.price}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* Unique Empty State */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center border border-dashed border-zinc-300 rounded-lg bg-white"
              >
                <Search size={48} className="text-zinc-300 mb-6" />
                <h3 className="text-2xl font-serif text-zinc-900 mb-2">No results found</h3>
                <p className="text-zinc-500 max-w-md mb-8">
                  We couldn't find any products matching "{searchQuery}" in the {gender} category. Try exploring different keywords or change your category.
                </p>
                <div className="flex gap-4">
                  <button onClick={() => setSearchQuery('')} className="px-6 py-3 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
                    Clear Search
                  </button>
                  <button onClick={() => setIsPopupOpen(true)} className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-full text-sm font-medium hover:bg-zinc-50 transition-colors">
                    Change Category
                  </button>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
      
      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row z-10 max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-black p-2 rounded-full transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
              
              {/* Image Side */}
              <div className="w-full md:w-1/2 relative bg-zinc-100 aspect-square md:aspect-auto md:h-auto min-h-[300px]">
                <Image 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  fill 
                  className="object-cover object-top" 
                />
              </div>

              {/* Details Side */}
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto">
                <p className="text-xs tracking-widest uppercase text-zinc-500 mb-2">{selectedProduct.category}</p>
                <h2 className="text-3xl font-serif font-bold text-black mb-4">{selectedProduct.name}</h2>
                <p className="text-2xl font-medium text-black mb-6">₹{selectedProduct.price}</p>
                
                <div className="prose text-zinc-600 mb-8 flex-1">
                  <p>{selectedProduct.description || "Premium quality crafted with care. Enjoy absolute comfort and distinctive style."}</p>
                  
                  {selectedProduct.specialOffers && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
                      <Sparkles size={16} className="mt-0.5 flex-shrink-0" />
                      <span className="font-medium">{selectedProduct.specialOffers}</span>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mt-6">
                    {selectedProduct.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs uppercase tracking-widest rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-zinc-100">
                  <button 
                    onClick={async () => {
                      if (!user) {
                        openAuthModal('login');
                      } else {
                        await addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }
                    }}
                    className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={20} /> Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
