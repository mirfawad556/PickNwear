"use server";

import fs from 'fs/promises';
import { existsSync, copyFileSync } from 'fs';
import os from 'os';
import path from 'path';
import { cookies } from 'next/headers';

const LOCAL_DB = path.join(process.cwd(), 'local-db.json');
const TMP_DB = path.join(os.tmpdir(), 'local-db.json');

function getDBPath() {
  if (process.env.VERCEL === '1') {
    if (!existsSync(TMP_DB) && existsSync(LOCAL_DB)) {
      copyFileSync(LOCAL_DB, TMP_DB);
    }
    return TMP_DB;
  }
  return LOCAL_DB;
}

async function getDB(retries = 3): Promise<any> {
  try {
    const data = await fs.readFile(getDBPath(), 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.carts) {
      parsed.carts = {}; // userId -> cart items array
      try { await fs.writeFile(getDBPath(), JSON.stringify(parsed, null, 2)); } catch(e) {}
    }
    return parsed;
  } catch (error: any) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 150));
      return getDB(retries - 1);
    }
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
    throw error;
  }
}

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("user_session")?.value;
}

export async function getCart() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    const cart = db.carts?.[userId] || [];
    return { success: true, cart };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function addToCart(product: any) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    if (!db.carts) db.carts = {};
    if (!db.carts[userId]) db.carts[userId] = [];

    const cart = db.carts[userId];
    const existingIndex = cart.findIndex((item: any) => item.productId === product.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        quantity: 1
      });
    }

    await saveDB(db);
    return { success: true, cart };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    if (!db.carts?.[userId]) return { success: true };

    db.carts[userId] = db.carts[userId].filter((item: any) => item.id !== cartItemId);
    await saveDB(db);
    
    return { success: true, cart: db.carts[userId] };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    if (!db.carts?.[userId]) return { success: true };

    const cart = db.carts[userId];
    const item = cart.find((i: any) => i.id === cartItemId);
    if (item) {
      item.quantity = quantity;
    }
    
    await saveDB(db);
    return { success: true, cart };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function clearCart() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    if (!db.carts) db.carts = {};
    db.carts[userId] = [];
    
    await saveDB(db);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
