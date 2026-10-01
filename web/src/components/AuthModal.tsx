"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { loginUser, signupUser, mockSendResetEmail, resetPassword } from '@/app/actions/user';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authView, setAuthView, setUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  React.useEffect(() => {
    if (!isAuthModalOpen) {
      setError("");
      setSuccess("");
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (authView === 'signup') {
        if (!name || !email || !password) throw new Error("Please fill all fields.");
        const res = await signupUser(name, email, password);
        if (res.success && res.user) {
          setUser(res.user as any);
          closeAuthModal();
        } else {
          throw new Error(res.message);
        }
      } else if (authView === 'login') {
        if (!email || !password) throw new Error("Please fill all fields.");
        const res = await loginUser(email, password);
        if (res.success && res.user) {
          setUser(res.user as any);
          closeAuthModal();
        } else {
          if (res.isWrongPassword) {
            setAuthView('forgot');
            setError("Incorrect password. Do you want to reset it?");
          } else {
            throw new Error(res.message);
          }
        }
      } else if (authView === 'forgot') {
        // Request reset
        if (!email) throw new Error("Please enter your email.");
        const res = await mockSendResetEmail(email);
        if (res.success) {
          setSuccess("Reset link has been successfully sent to your email!");
        } else {
          throw new Error(res.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 z-10"
        >
          <button onClick={closeAuthModal} className="absolute top-4 right-4 text-zinc-400 hover:text-black transition-colors">
            <X size={20} />
          </button>

          <h2 className="text-3xl font-serif font-bold text-center mb-6">
            {authView === 'login' && "Sign In to PickNwear"}
            {authView === 'signup' && "Create an Account"}
            {authView === 'forgot' && "Recover Password"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm text-center border border-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authView === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-black outline-none transition-all" placeholder="John Doe" />
                </div>
              </div>
            )}

            {(authView === 'login' || authView === 'signup' || authView === 'forgot') && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-black outline-none transition-all" placeholder="you@example.com" />
                </div>
              </div>
            )}

            {(authView === 'login' || authView === 'signup') && (
              <div>
                <label className="block text-sm font-medium text-black mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-black outline-none transition-all" placeholder="••••••••" />
                </div>
              </div>
            )}

            <button disabled={loading} type="submit" className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50">
              {loading ? "Processing..." : (
                <>
                  {authView === 'login' && "Sign In"}
                  {authView === 'signup' && "Create Account"}
                  {authView === 'forgot' && "Send Reset Link"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-500 flex flex-col gap-2">
            {authView === 'login' && (
              <>
                <p>Don't have an account? <button type="button" onClick={() => {setAuthView('signup'); setError("");}} className="text-black font-medium hover:underline">Sign up</button></p>
              </>
            )}
            {authView === 'signup' && (
              <p>Already have an account? <button type="button" onClick={() => {setAuthView('login'); setError("");}} className="text-black font-medium hover:underline">Sign in</button></p>
            )}
            {authView === 'forgot' && (
              <p>Remembered your password? <button type="button" onClick={() => {setAuthView('login'); setError(""); setSuccess("");}} className="text-black font-medium hover:underline">Back to Login</button></p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
