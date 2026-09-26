"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, User, LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Plus, Image as ImageIcon, Smartphone, Mail, AlertTriangle, Upload, X, CheckCircle, Layers, Pencil, Trash2, Save } from 'lucide-react';
import { loginAdmin, setupAdmin, checkAdminSession, addProduct, getProducts, deleteProduct, updateProduct, getAllUsers } from '@/app/actions/admin';

type AdminState = "LOGIN" | "SETUP" | "DASHBOARD";

export default function AdminPage() {
  const [view, setView] = useState<AdminState>("LOGIN");
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Setup State
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  
  // Dashboard State
  const [activeTab, setActiveTab] = useState("products");

  // Product Form State
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Male",
    price: "",
    discountPercent: "0",
    clothingType: "",
    colors: "",
    specialOffers: "",
    description: "",
    image: ""
  });
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  // Collections Tab State
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<any>({});
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  // Users Tab State
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserItems, setSelectedUserItems] = useState<{ user: string, items: any[] } | null>(null);

  useEffect(() => {
    // Basic check if they are already logged in when returning
    checkAdminSession().then(session => {
      if (session) {
        setView("DASHBOARD");
      }
    });
  }, []);

  const fetchAdminProducts = async () => {
    setCollectionsLoading(true);
    const res = await getProducts();
    if (res.success) setAdminProducts(res.products);
    setCollectionsLoading(false);
  };

  const fetchRegisteredUsers = async () => {
    setUsersLoading(true);
    const res = await getAllUsers();
    if (res.success) setRegisteredUsers(res.users);
    setUsersLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'collections') {
      fetchAdminProducts();
    }
    if (activeTab === 'overview' || activeTab === 'users') {
      fetchRegisteredUsers();
    }
  }, [activeTab]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setProductError("Invalid file type. Please upload a JPG, PNG, GIF, or WebP.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm(prev => ({ ...prev, image: event.target?.result as string }));
      setProductError("");
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");
    setProductSuccess(false);

    if (!productForm.image) return setProductError("Product image is required.");
    if (!productForm.name.trim()) return setProductError("Product name is required.");
    if (!productForm.price || Number(productForm.price) <= 0) return setProductError("Please enter a valid positive price.");
    if (!productForm.clothingType.trim()) return setProductError("Clothing type is required.");
    
    setProductLoading(true);
    const res = await addProduct({
      ...productForm,
      price: Number(productForm.price),
      discountPercent: Number(productForm.discountPercent) || 0
    });
    setProductLoading(false);

    if (res.success) {
      setProductSuccess(true);
      setProductForm({
        name: "", category: "Male", price: "", discountPercent: "0",
        clothingType: "", colors: "", specialOffers: "", description: "", image: ""
      });
      if (activeTab === 'collections') fetchAdminProducts();
      setTimeout(() => setProductSuccess(false), 10000);
    } else {
      setProductError(res.message || "Failed to add product.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteProduct(id);
      fetchAdminProducts();
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setEditProductForm(product);
  };

  const handleUpdateProduct = async () => {
    if (!editProductForm.name || !editProductForm.price) {
      alert("Name and Price are required");
      return;
    }
    const res = await updateProduct(editingProductId!, {
      ...editProductForm,
      price: Number(editProductForm.price),
      discountPercent: Number(editProductForm.discountPercent) || 0
    });
    if (res.success) {
      setEditingProductId(null);
      fetchAdminProducts();
    } else {
      alert(res.message || "Failed to update product");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await loginAdmin(username, password);
    setLoading(false);

    if (res.success) {
      if (res.isFirstLogin) {
        setView("SETUP");
      } else {
        setView("DASHBOARD");
      }
    } else {
      setError(res.message || "Invalid credentials.");
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      setError("New username and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await setupAdmin(newUsername, newPassword, whatsapp);
    setLoading(false);

    if (res.success) {
      setView("DASHBOARD");
    } else {
      setError(res.message || "Failed to setup.");
    }
  };

  // -------------------------
  // LOGIN VIEW
  // -------------------------
  if (view === "LOGIN") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 pt-24 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white max-w-md w-full p-8 rounded-xl shadow-2xl border border-zinc-200"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-bold text-black font-serif">Admin Access</h1>
            <p className="text-zinc-500 text-sm mt-2">Restricted Area. Authorized personnel only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="Enter admin username"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 transition-colors shadow-lg">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // -------------------------
  // FIRST TIME SETUP VIEW
  // -------------------------
  if (view === "SETUP") {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-4 pt-24 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-xl w-full p-8 rounded-xl shadow-2xl border border-zinc-200"
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-100">
            <AlertTriangle className="text-amber-500" size={28} />
            <div>
              <h2 className="text-xl font-bold text-black">First-Time Setup Required</h2>
              <p className="text-sm text-zinc-500">You must change the default credentials before accessing the CEO Dashboard.</p>
            </div>
          </div>

          <form onSubmit={handleSetup} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">New Username</label>
                <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-black" placeholder="CEO Username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-black" placeholder="Strong password" />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100">
              <h3 className="font-semibold text-black mb-4">Link Notification Accounts</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><Smartphone size={20}/></div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-black">WhatsApp Number</label>
                    <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-black mt-1" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Mail size={20}/></div>
                  <div className="flex-1">
                    <button type="button" className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-50 flex items-center justify-center gap-2">
                      <Image src="/logo.jpg" alt="Google" width={16} height={16} className="rounded-full opacity-50" />
                      Link Google Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <div className="flex justify-end mt-2 mb-2">
              <button 
                type="button" 
                onClick={() => setView("DASHBOARD")}
                className="text-sm text-zinc-500 hover:text-black hover:underline transition-colors font-medium"
              >
                Skip for now
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Complete Setup & Access Dashboard"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // -------------------------
  // DASHBOARD VIEW
  // -------------------------
  return (
    <div className="min-h-screen bg-[#faf9f6] pt-24 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white min-h-[calc(100vh-6rem)] fixed left-0 flex flex-col shadow-2xl z-20">
        <div className="p-6">
          <h2 className="text-sm uppercase tracking-widest text-zinc-400 font-bold mb-8">CEO Dashboard</h2>
          <nav className="space-y-2">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'products', icon: Plus, label: 'Add Product' },
              { id: 'collections', icon: Layers, label: 'Collections' },
              { id: 'users', icon: Users, label: 'Customers' },
              { id: 'settings', icon: Settings, label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'hover:bg-zinc-800 text-zinc-300'}`}
              >
                <tab.icon size={18} /> {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={() => setView("LOGIN")} className="mt-auto m-6 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-950 text-red-400 transition-all">
          <LogOut size={18} /> Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-10">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-serif font-bold text-black mb-8">Real-time Activity</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">Active Carts</p>
                <p className="text-3xl font-bold text-black">12</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">Today's Revenue</p>
                <p className="text-3xl font-bold text-black">₹45,900</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <p className="text-zinc-500 text-sm font-medium mb-2">Pending Orders</p>
                <p className="text-3xl font-bold text-amber-500">4</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-black mb-4 font-serif">Registered Users</h2>
            <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Address</th>
                    <th className="px-6 py-4 font-medium">Items Bought</th>
                    <th className="px-6 py-4 font-medium">Total Spent</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading users...</td>
                    </tr>
                  ) : registeredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No users registered yet.</td>
                    </tr>
                  ) : (
                    registeredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-black">{u.name}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{u.email}</td>
                        <td className="px-6 py-4 text-zinc-600 max-w-xs truncate" title={u.address}>{u.address}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedUserItems({ user: u.name, items: u.purchasedItems || [] })}
                            className="text-black font-semibold hover:text-red-600 hover:underline transition-colors focus:outline-none"
                          >
                            {u.totalItemsBought}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black font-bold">₹{u.totalSpent}</td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-serif font-bold text-black">Product Management</h1>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 mb-8 relative">
              {productSuccess && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white font-medium text-center py-3 rounded-t-xl flex items-center justify-center gap-3">
                  <CheckCircle size={20} /> 
                  <span>Product successfully added!</span>
                  <Link href="/collections" className="underline font-bold hover:text-green-100 transition-colors ml-4 border border-white/30 px-3 py-1 rounded-md">
                    View in Collection →
                  </Link>
                </div>
              )}
              
              <h2 className={`text-lg font-bold text-black mb-4 ${productSuccess ? 'mt-6' : ''}`}>Add New Product Form</h2>
              
              {productError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                  {productError}
                </div>
              )}

              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleAddProduct}>
                
                {/* Image Upload Area */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Product Image *</label>
                  {!productForm.image ? (
                    <label className="border-2 border-dashed border-zinc-300 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-500 hover:bg-zinc-50 cursor-pointer transition-colors group">
                      <input type="file" accept="image/png, image/jpeg, image/gif, image/webp" className="hidden" onChange={handleImageUpload} />
                      <div className="bg-zinc-100 p-3 rounded-full mb-3 group-hover:bg-zinc-200 transition-colors">
                        <Upload size={24} className="text-zinc-600" />
                      </div>
                      <p className="font-medium text-black">Click to upload image</p>
                      <p className="text-sm mt-1">Supports JPG, PNG, GIF, WebP</p>
                    </label>
                  ) : (
                    <div className="relative border border-zinc-200 rounded-xl overflow-hidden aspect-video max-h-[300px] w-full bg-zinc-50 flex items-center justify-center group">
                      <img src={productForm.image} alt="Product preview" className="h-full w-auto object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setProductForm({ ...productForm, image: "" })} className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-50 transition-colors">
                          <X size={18} /> Remove Image
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Product Name *</label>
                  <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="e.g. Silk Evening Gown" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Category Assignment</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Child">Child</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Price (₹) *</label>
                  <input type="number" min="1" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="1999" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Discount Percentage (%)</label>
                  <input type="number" min="0" max="100" value={productForm.discountPercent} onChange={(e) => setProductForm({ ...productForm, discountPercent: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="10" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Clothing Type *</label>
                  <input type="text" value={productForm.clothingType} onChange={(e) => setProductForm({ ...productForm, clothingType: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="e.g. Denim, Velvet, Linen" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Available Colors</label>
                  <input type="text" value={productForm.colors} onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="Red, Blue, Green" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Special Offers / Free Item Promotions</label>
                  <input type="text" value={productForm.specialOffers} onChange={(e) => setProductForm({ ...productForm, specialOffers: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="e.g. Buy 1 Get 1 Free, Free Matching Scarf" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">Detailed Description</label>
                  <textarea rows={4} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg outline-none focus:border-black" placeholder="Enter rich description here..."></textarea>
                </div>

                <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                  <button type="button" onClick={() => setProductForm({ name: "", category: "Male", price: "", discountPercent: "0", clothingType: "", colors: "", specialOffers: "", description: "", image: "" })} className="px-6 py-2 border border-zinc-200 rounded-lg text-black hover:bg-zinc-50 transition-colors font-medium">Clear Form</button>
                  <button type="submit" disabled={productLoading} className="px-6 py-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors font-medium disabled:opacity-50">
                    {productLoading ? "Saving..." : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* COLLECTIONS TAB */}
        {activeTab === 'collections' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-serif font-bold text-black mb-8">Collections</h1>
            
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              {collectionsLoading ? (
                <div className="p-8 text-center text-zinc-500">Loading products...</div>
              ) : adminProducts.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">No products added yet. <button onClick={() => setActiveTab('products')} className="text-black underline font-medium">Add one now</button>.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                    <tr>
                      <th className="px-6 py-4 font-medium w-16">Image</th>
                      <th className="px-6 py-4 font-medium">Product Name</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {adminProducts.map(product => (
                      <tr key={product.id}>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 rounded bg-zinc-100 relative overflow-hidden">
                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-black">
                          {editingProductId === product.id ? (
                            <input type="text" value={editProductForm.name} onChange={e => setEditProductForm({...editProductForm, name: e.target.value})} className="border border-zinc-300 rounded px-2 py-1 w-full" />
                          ) : product.name}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                          {editingProductId === product.id ? (
                            <select value={editProductForm.category} onChange={e => setEditProductForm({...editProductForm, category: e.target.value})} className="border border-zinc-300 rounded px-2 py-1">
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Child">Child</option>
                            </select>
                          ) : product.category}
                        </td>
                        <td className="px-6 py-4 font-semibold text-black">
                          {editingProductId === product.id ? (
                            <input type="number" value={editProductForm.price} onChange={e => setEditProductForm({...editProductForm, price: e.target.value})} className="border border-zinc-300 rounded px-2 py-1 w-20" />
                          ) : `₹${product.price}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {editingProductId === product.id ? (
                              <>
                                <button onClick={handleUpdateProduct} className="text-green-600 hover:text-green-700 bg-green-50 p-2 rounded-full transition-colors" title="Save"><Save size={16} /></button>
                                <button onClick={() => setEditingProductId(null)} className="text-zinc-600 hover:text-zinc-700 bg-zinc-100 p-2 rounded-full transition-colors" title="Cancel"><X size={16} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-700 bg-blue-50 p-2 rounded-full transition-colors" title="Edit"><Pencil size={16} /></button>
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-700 bg-red-50 p-2 rounded-full transition-colors" title="Delete"><Trash2 size={16} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {/* USERS TAB (Customers) */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-3xl font-serif font-bold text-black mb-8">Registered Customers</h1>
            
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Customer Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Address</th>
                    <th className="px-6 py-4 font-medium">Items Bought</th>
                    <th className="px-6 py-4 font-medium">Total Spent</th>
                    <th className="px-6 py-4 font-medium">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading customers...</td>
                    </tr>
                  ) : registeredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No customers registered yet.</td>
                    </tr>
                  ) : (
                    registeredUsers.map(u => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-black">{u.name}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-600">{u.email}</td>
                        <td className="px-6 py-4 text-zinc-600 max-w-xs truncate" title={u.address}>{u.address}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => setSelectedUserItems({ user: u.name, items: u.purchasedItems || [] })}
                            className="text-black font-semibold hover:text-red-600 hover:underline transition-colors focus:outline-none"
                          >
                            {u.totalItemsBought}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black font-bold">₹{u.totalSpent}</td>
                        <td className="px-6 py-4 text-zinc-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* PURCHASED ITEMS MODAL */}
        <AnimatePresence>
          {selectedUserItems && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedUserItems(null)}
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
                    <h3 className="text-xl font-bold text-black font-serif">Order History</h3>
                    <p className="text-sm text-zinc-500 mt-1">Purchased items by <span className="font-semibold text-black">{selectedUserItems.user}</span></p>
                  </div>
                  <button 
                    onClick={() => setSelectedUserItems(null)} 
                    className="p-2 text-zinc-400 hover:bg-zinc-200 hover:text-black rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {selectedUserItems.items.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
                      <ShoppingBag size={48} className="mb-4 opacity-20" />
                      <p>This user hasn't bought any items yet.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selectedUserItems.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 hover:shadow-sm transition-all bg-white">
                          <div className="relative w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-black text-sm">{item.name}</h4>
                            <p className="text-xs text-zinc-500 mt-1">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-black">₹{item.price * item.quantity}</p>
                            <p className="text-xs text-zinc-400 mt-1">₹{item.price} each</p>
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
      </main>
    </div>
  );
}
