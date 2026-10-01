"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, MapPin, Edit2 } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/app/actions/order';
import { updateUserAddress } from "@/app/actions/user";

type CheckoutStep = 'CART' | 'CONFIRM_PURCHASE' | 'PAYMENT_DETAILS' | 'CONFIRM_ADDRESS' | 'SUCCESS';

export default function CartPanel() {
  const { isCartOpen, setIsCartOpen, cart, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('CART');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // If cart is closed, reset to CART view
  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => setStep('CART'), 300); // reset after animation
    setIsEditingAddress(false);
  };

  const handleSaveAddress = async () => {
    if (!addressInput.trim()) return;
    setIsSavingAddress(true);
    const res = await updateUserAddress(addressInput);
    if (res.success && user) {
      setUser({ ...user, address: addressInput });
      setIsEditingAddress(false);
    } else {
      alert("Failed to save address: " + res.message);
    }
    setIsSavingAddress(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsPlacingOrder(true);
    const finalAddress = user.address || "No address provided";
    const res = await createOrder({
      total: totalPrice,
      paymentMethod: "Cash on Delivery",
      address: finalAddress,
      email: user.email,
      firstName: user.name?.split(" ")[0] || "Customer",
      lastName: user.name?.split(" ").slice(1).join(" ") || "",
      items: cart
    });
    if (res.success) {
      await clearCart();
      setStep('SUCCESS');
    } else {
      alert("Failed to place order: " + res.message);
    }
    setIsPlacingOrder(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-black flex items-center gap-2">
                <ShoppingBag size={20} /> My Cart
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
              <AnimatePresence mode="wait">
                {step === 'CART' && (
                  <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="relative w-20 h-24 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-black text-sm">{item.name}</h3>
                                <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-zinc-400 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <p className="text-black font-semibold mt-1">₹{item.price}</p>
                              
                              <div className="mt-auto flex items-center gap-3 w-max bg-zinc-50 border border-zinc-200 rounded-lg p-1">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-white rounded transition-colors text-zinc-600"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-white rounded transition-colors text-zinc-600"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 'CONFIRM_PURCHASE' && (
                  <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag size={48} className="text-zinc-900 mb-6" />
                    <h3 className="text-2xl font-serif text-black mb-4">Are you sure you want to purchase?</h3>
                    <p className="text-zinc-500 mb-8 max-w-xs">You are about to proceed to checkout with {cart.length} items.</p>
                    <div className="flex gap-4 w-full">
                      <button onClick={() => setStep('CART')} className="flex-1 py-3 bg-zinc-100 text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors">
                        No, back to cart
                      </button>
                      <button onClick={() => setStep('PAYMENT_DETAILS')} className="flex-1 py-3 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        Yes, continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'PAYMENT_DETAILS' && (
                  <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                    <h3 className="text-xl font-bold text-black mb-6">Payment Details</h3>
                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 mb-6">
                      <div className="flex justify-between mb-4">
                        <span className="text-zinc-600">Subtotal</span>
                        <span className="font-medium text-black">₹{totalPrice}</span>
                      </div>
                      <div className="flex justify-between mb-4 text-green-600">
                        <span>Coupon applied (FESTIVE20)</span>
                        <span>- ₹0</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span className="text-zinc-600">Shipping</span>
                        <span className="font-medium text-black">Free</span>
                      </div>
                      <div className="border-t border-zinc-200 pt-4 mt-4 flex justify-between">
                        <span className="font-bold text-black text-lg">Final Price</span>
                        <span className="font-bold text-black text-xl">₹{totalPrice}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setStep('CONFIRM_ADDRESS');
                        if (!user?.address) {
                          setAddressInput("");
                          setIsEditingAddress(true);
                        }
                      }} 
                      className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                      OK
                    </button>
                  </motion.div>
                )}

                {step === 'CONFIRM_ADDRESS' && (
                  <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full flex flex-col">
                    <h3 className="text-xl font-bold text-black mb-6">Confirm Address</h3>
                    
                    {isEditingAddress ? (
                      <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 mb-6 flex flex-col gap-4">
                        <textarea
                          value={addressInput}
                          onChange={(e) => setAddressInput(e.target.value)}
                          placeholder="Enter your full address..."
                          className="w-full text-sm border border-zinc-300 rounded-lg p-3 outline-none focus:border-black resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-3 justify-end mt-2">
                          <button 
                            onClick={() => setIsEditingAddress(false)}
                            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveAddress}
                            disabled={isSavingAddress || !addressInput.trim()}
                            className="px-4 py-2 text-sm font-bold text-white bg-black hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isSavingAddress ? 'Saving...' : 'Save Address'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-200 mb-6 flex gap-4 relative group">
                        <MapPin className="text-zinc-400 shrink-0" />
                        <div className="pr-6">
                          <p className="font-medium text-black mb-1">{user?.name}</p>
                          <p className="text-zinc-600 text-sm leading-relaxed">{user?.address || "No address provided. Please edit to add one."}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setAddressInput(user?.address || "");
                            setIsEditingAddress(true);
                          }}
                          className="absolute top-6 right-4 p-2 text-zinc-400 hover:text-black hover:bg-zinc-200 rounded-full transition-all"
                          title="Edit Address"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      <button 
                        onClick={handlePlaceOrder} 
                        disabled={isPlacingOrder || !user?.address || isEditingAddress}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isPlacingOrder ? "Processing..." : "Confirm & Place Order"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 'SUCCESS' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center">
                    <CheckCircle size={64} className="text-green-500 mb-6" />
                    <h3 className="text-2xl font-serif text-black mb-4">Order successfully placed!</h3>
                    <p className="text-zinc-500 mb-8 max-w-xs">Your order has been placed successfully. A notification has been sent to the admin.</p>
                    <button onClick={handleClose} className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                      Continue Shopping
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {cart.length > 0 && step === 'CART' && (
              <div className="p-6 border-t border-zinc-100 bg-zinc-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-500 font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-black">₹{totalPrice}</span>
                </div>
                <button 
                  onClick={() => setStep('CONFIRM_PURCHASE')}
                  className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
