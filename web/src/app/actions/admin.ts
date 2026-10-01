"use server";

import fs from 'fs/promises';
import { existsSync, copyFileSync } from 'fs';
import os from 'os';
import path from 'path';
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

const LOCAL_DB = path.join(process.cwd(), 'local-db.json');
const TMP_DB = path.join(os.tmpdir(), 'local-db.json');

function getDBPath() {
  // Use /tmp only in production (Vercel) to avoid EROFS, keep local-db.json in development
  const isVercel = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isVercel) {
    if (!existsSync(TMP_DB) && existsSync(LOCAL_DB)) {
      try { copyFileSync(LOCAL_DB, TMP_DB); } catch(e) {}
    }
    return TMP_DB;
  }
  return LOCAL_DB;
}

// Simple JSON database helper
async function getDB(retries = 3): Promise<any> {
  try {
    const data = await fs.readFile(getDBPath(), 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.products) {
      parsed.products = [];
      try { await fs.writeFile(getDBPath(), JSON.stringify(parsed, null, 2)); } catch(e) {}
    }
    return parsed;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const initialState = {
        admin: {
          id: "admin-1",
          username: "PickNwear",
          password: await bcrypt.hash("Ristakabab", 10),
          isFirstLogin: true,
          whatsapp: null
        },
        products: []
      };
      await fs.writeFile(getDBPath(), JSON.stringify(initialState, null, 2));
      return initialState;
    }
    
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 150));
      return getDB(retries - 1);
    }

    console.error("Database read error (likely OneDrive lock):", error);
    throw error;
  }
}

async function saveDB(data: any, retries = 3): Promise<void> {
  try {
    await fs.writeFile(getDBPath(), JSON.stringify(data, null, 2));
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 150));
      return saveDB(data, retries - 1);
    }
    console.error("Database write error (likely OneDrive lock):", error);
    throw error;
  }
}

export async function addProduct(productData: any) {
  try {
    const db = await getDB();
    let imageUrl = productData.image;

    if (imageUrl && imageUrl.startsWith('data:image')) {
      const matches = imageUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `product-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      }
    }

    const newProduct = {
      id: Date.now().toString(),
      ...productData,
      image: imageUrl,
      createdAt: new Date().toISOString()
    };
    db.products.push(newProduct);
    await saveDB(db);
    
    revalidatePath('/collections');
    revalidatePath('/admin');
    
    return { success: true, product: newProduct };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to add product" };
  }
}

export async function getProducts() {
  noStore();
  try {
    const db = await getDB();
    return { success: true, products: db.products || [] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const db = await getDB();
    db.products = db.products.filter((p: any) => p.id !== productId);
    await saveDB(db);
    revalidatePath('/collections');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete product" };
  }
}

export async function updateProduct(productId: string, productData: any) {
  try {
    const db = await getDB();
    const index = db.products.findIndex((p: any) => p.id === productId);
    if (index === -1) {
      return { success: false, message: "Product not found" };
    }

    let imageUrl = productData.image;
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const matches = imageUrl.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `product-${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, filename), buffer);
        imageUrl = `/uploads/${filename}`;
      }
    }

    db.products[index] = { ...db.products[index], ...productData };
    if (imageUrl) {
      db.products[index].image = imageUrl;
    }
    
    await saveDB(db);
    revalidatePath('/collections');
    revalidatePath('/admin');
    return { success: true, product: db.products[index] };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update product" };
  }
}

export async function loginAdmin(username: string, password: string) {
  try {
    const db = await getDB();
    const admin = db.admin;

    if (!admin || admin.username !== username) {
      return { success: false, message: "Invalid credentials. Unauthorized access is logged." };
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return { success: false, message: "Invalid credentials. Unauthorized access is logged." };
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", admin.id, { secure: true, httpOnly: true });

    return { 
      success: true, 
      isFirstLogin: admin.isFirstLogin 
    };

  } catch (error: any) {
    return { success: false, message: error.message || "An error occurred." };
  }
}

export async function setupAdmin(newUsername: string, newPassword: string, whatsapp: string) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin_session")?.value;
    
    if (!adminId) return { success: false, message: "Not authenticated" };

    const db = await getDB();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.admin.username = newUsername;
    db.admin.password = hashedPassword;
    db.admin.whatsapp = whatsapp;
    db.admin.isFirstLogin = false;

    await saveDB(db);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Setup failed." };
  }
}

export async function checkAdminSession() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session")?.value;
  
  if (!adminId) return null;

  try {
    const db = await getDB();
    
    // If the database was reset (isFirstLogin is true), we must invalidate 
    // any existing cookies so they are forced to see the login page again.
    if (db.admin && db.admin.id === adminId && !db.admin.isFirstLogin) {
      return adminId;
    }
    
    // Invalid cookie or reset DB
    cookieStore.delete("admin_session");
    return null;
  } catch (error) {
    cookieStore.delete("admin_session");
    return null;
  }
}

export async function getAllUsers() {
  noStore();
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin_session")?.value;
    if (!adminId) return { success: false, message: "Unauthorized" };

    const db = await getDB();
    const users = db.users || [];
    const orders = db.orders || [];
    
    // Do not return passwords
    const safeUsers = users.map((u: any) => {
      const userOrders = orders.filter((o: any) => o.userId === u.id);
      const purchasedItems = userOrders.flatMap((o: any) => o.items);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address || "No address provided",
        createdAt: u.createdAt,
        totalItemsBought: u.totalItemsBought || 0,
        totalSpent: u.totalSpent || 0,
        purchasedItems: purchasedItems
      };
    });

    return { success: true, users: safeUsers };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getContactDetails() {
  try {
    const db = await getDB();
    const whatsapp = db.admin?.whatsapp || "+1 (555) 123-4567";
    const email = db.admin?.email || "support@picknwear.com";
    const phone = "+1 (555) 987-6543"; // Dummy phone since we didn't ask for it
    
    return { success: true, contact: { whatsapp, email, phone } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
