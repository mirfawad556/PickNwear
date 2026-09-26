"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, MapPin, Check, X as XIcon, Edit2, Clock, Phone, Mail, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { updateUserAddress } from "@/app/actions/user";
import { getUserPastOrders } from "@/app/actions/order";
import { getContactDetails } from "@/app/actions/admin";

export default function Header() {
  const { user, openAuthModal, logout, setUser } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<any>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    
    // add a background blur when scrolled past top
    if (latest > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }

    // hide on scroll down, show on scroll up
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (pathname === '/' && path === '/#shop');
    return `px-3 py-1.5 md:px-6 md:py-2.5 rounded-full text-[11px] md:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
      isActive 
        ? "text-white bg-black shadow-[0_2px_10px_rgba(0,0,0,0.3)]" 
        : "text-zinc-400 hover:text-white hover:bg-black/50"
    }`;
  };

  const handleOpenContact = async () => {
    setIsContactOpen(true);
    if (!contactInfo) {
      const res = await getContactDetails();
      if (res.success) {
        setContactInfo(res.contact);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!addressInput.trim()) return;
    setIsSavingAddress(true);
    const res = await updateUserAddress(addressInput);
    if (res.success && user) {
      setUser({ ...user, address: res.address });
      setIsEditingAddress(false);
    } else {
      alert(res.message || "Failed to update address");
    }
    setIsSavingAddress(false);
  };

  const handleOpenPastOrders = async () => {
    setIsProfileOpen(false);
    setIsPastOrdersOpen(true);
    setLoadingOrders(true);
    const res = await getUserPastOrders();
    if (res.success) {
      setPastOrders(res.orders || []);
    }
    setLoadingOrders(false);
  };

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md border-b border-black/10 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-4 md:px-12 py-3 md:py-0 md:h-24 flex flex-wrap md:flex-nowrap items-center justify-between relative">
        {/* Logo and Name (Pushed Left) - Black Branding */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group relative z-10 w-auto">
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105 border-2 border-black">
            <Image src="/logo.jpg" alt="PickNwear Logo" fill className="object-cover" />
          </div>
          <span className="font-bold text-xl md:text-2xl tracking-tight text-black transition-colors hidden sm:block">
            PickNwear
          </span>
        </Link>

        {/* Central Dark Glass Navigation */}
        <nav className="order-last md:order-none w-full md:w-auto mt-3 md:mt-0 flex items-center justify-center gap-1 md:gap-2 px-1 md:px-2 py-1 md:py-2 rounded-full bg-black/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-10 transition-all duration-300 hover:bg-black md:absolute md:left-1/2 md:-translate-x-1/2 overflow-x-auto no-scrollbar">
          <Link href="/" className={getLinkClasses("/")}>Home</Link>
          <Link href="/collections" className={getLinkClasses("/collections")}>Collections</Link>
          <button onClick={handleOpenContact} className="px-3 py-1.5 md:px-6 md:py-2.5 rounded-full text-[11px] md:text-sm font-semibold transition-all duration-300 text-zinc-400 hover:text-white hover:bg-black/50 whitespace-nowrap">Contact</button>
          <Link href="/admin" className={getLinkClasses("/admin")}>Admin</Link>
        </nav>

        {/* Actions (Pushed Right) - Solid Black Icons */}
        <div className="flex items-center gap-3 md:gap-6 text-black relative z-10 w-auto justify-end">
          {user ? (
            <div className="relative flex items-center gap-3">
              <span className="text-sm font-semibold hidden md:block text-black">Hi, {user.name.split(' ')[0]}</span>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="Profile Menu" 
                title="Profile"
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all shadow-md ${isProfileOpen ? 'bg-zinc-800 scale-105' : 'bg-black hover:bg-zinc-800 hover:scale-105'}`}
              >
                <User size={20} />
              </button>
              
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40 bg-transparent"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-14 right-0 w-64 bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden z-50 flex flex-col"
                    >
                      <div className="p-4 border-b border-zinc-100 bg-zinc-50">
                        <p className="font-bold text-black text-lg">{user.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="p-3 border-b border-zinc-100">
                        {isEditingAddress ? (
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={addressInput}
                              onChange={(e) => setAddressInput(e.target.value)}
                              placeholder="Enter your full address..."
                              className="w-full text-sm border border-zinc-200 rounded-md p-2 outline-none focus:border-black resize-none"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => setIsEditingAddress(false)}
                                className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-md"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleSaveAddress}
                                disabled={isSavingAddress || !addressInput.trim()}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-black hover:bg-zinc-800 rounded-md disabled:opacity-50"
                              >
                                {isSavingAddress ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : user.address ? (
                          <div className="group relative rounded-md p-2 hover:bg-zinc-50 border border-transparent hover:border-zinc-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 mb-1">
                                <MapPin size={12} /> Shipping Address
                              </div>
                              <button 
                                onClick={() => {
                                  setAddressInput(user.address || "");
                                  setIsEditingAddress(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-black transition-all"
                                title="Edit Address"
                              >
                                <Edit2 size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-zinc-500 line-clamp-2">{user.address}</p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setAddressInput("");
                              setIsEditingAddress(true);
                            }}
                            className="text-left px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors w-full flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-zinc-400" /> + Add Address
                          </button>
                        )}
                      </div>

                      <div className="p-2 flex flex-col gap-1">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsCartOpen(true);
                          }}
                          className="text-left px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors w-full flex items-center gap-2"
                        >
                          <ShoppingBag size={14} className="text-zinc-400" /> My Cart
                        </button>
                        <button 
                          onClick={handleOpenPastOrders}
                          className="text-left px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors w-full flex items-center gap-2"
                        >
                          <Clock size={14} className="text-zinc-400" /> View Past Orders
                        </button>
                      </div>
                      <div className="p-2 border-t border-zinc-100">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={() => openAuthModal('login')}
              aria-label="Account" 
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-zinc-800 hover:scale-105 transition-all shadow-md"
            >
              <User size={20} />
            </button>
          )}
          
          <button 
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart" 
            className="h-10 px-3 md:px-4 flex items-center justify-center gap-1.5 md:gap-2 rounded-full bg-black text-white hover:bg-zinc-800 hover:scale-105 transition-all shadow-md"
          >
            <ShoppingBag size={18} className="md:w-5 md:h-5" />
            <span className="text-xs md:text-sm font-bold bg-white text-black px-1.5 md:px-2 py-0.5 rounded-full">{totalItems}</span>
          </button>
        </div>
      </div>

      {/* PAST ORDERS MODAL */}
      <AnimatePresence>
        {isPastOrdersOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsPastOrdersOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10 max-h-[85vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div>
                  <h3 className="text-xl font-bold text-black font-serif">Past Orders</h3>
                  <p className="text-sm text-zinc-500 mt-1">Your order history</p>
                </div>
                <button 
                  onClick={() => setIsPastOrdersOpen(false)} 
                  className="p-2 text-zinc-400 hover:bg-zinc-200 hover:text-black rounded-full transition-colors"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-zinc-50/50">
                {loadingOrders ? (
                  <div className="py-12 flex items-center justify-center text-zinc-500">
                    Loading your orders...
                  </div>
                ) : pastOrders.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p>You haven't placed any orders yet.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {pastOrders.map((order, idx) => (
                      <div key={idx} className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-black">Order Placed</p>
                            <p className="text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-black">Total</p>
                            <p className="text-zinc-500">₹{order.totalAmount}</p>
                          </div>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                          {order.items.map((item: any, iIdx: number) => (
                            <div key={iIdx} className="flex gap-4 items-center">
                              <div className="relative w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-black text-sm">{item.name}</h4>
                                <p className="text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-black">₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACT MODAL */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col z-10"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                <div>
                  <h3 className="text-xl font-bold text-black font-serif">Contact Us</h3>
                  <p className="text-sm text-zinc-500 mt-1">We're here to help.</p>
                </div>
                <button 
                  onClick={() => setIsContactOpen(false)} 
                  className="p-2 text-zinc-400 hover:bg-zinc-200 hover:text-black rounded-full transition-colors"
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                {!contactInfo ? (
                  <div className="py-8 text-center text-zinc-500">Loading details...</div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors rounded-full flex items-center justify-center text-zinc-600 shrink-0">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium mb-1">Phone Number</p>
                        <p className="font-semibold text-black">{contactInfo.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors rounded-full flex items-center justify-center text-zinc-600 shrink-0">
                        <MessageCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium mb-1">WhatsApp</p>
                        <p className="font-semibold text-black">{contactInfo.whatsapp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 bg-zinc-100 group-hover:bg-black group-hover:text-white transition-colors rounded-full flex items-center justify-center text-zinc-600 shrink-0">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 font-medium mb-1">Email</p>
                        <p className="font-semibold text-black break-all">{contactInfo.email}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                <button 
                  onClick={() => setIsContactOpen(false)}
                  className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
