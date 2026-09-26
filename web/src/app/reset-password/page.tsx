"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { resetPassword } from '@/app/actions/user';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!token) {
    return (
      <div className="text-center p-8">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Invalid Link</h2>
        <p className="text-zinc-500 mb-6">This password reset link is invalid or missing.</p>
        <Link href="/" className="text-black font-medium underline">Return to Home</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Please enter a new password");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await resetPassword(token, password);
      if (res.success) {
        setSuccess("Your password has been successfully reset!");
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-8">
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Password Updated</h2>
        <p className="text-zinc-500 mb-6">{success}</p>
        <p className="text-sm text-zinc-400">Redirecting to homepage...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-serif font-bold text-center mb-2">Reset Password</h2>
      <p className="text-center text-zinc-500 mb-8">Please enter your new secure password.</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-1">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl bg-zinc-50 focus:bg-white focus:border-black outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-black text-white font-medium py-3 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"} <ArrowRight size={18} />
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-100"
      >
        <Suspense fallback={<div className="p-12 text-center text-zinc-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
