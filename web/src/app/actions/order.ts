"use server";

import fs from 'fs/promises';
import path from 'path';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

const DB_PATH = path.join(process.cwd(), 'local-db.json');

async function getDB(retries = 3): Promise<any> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.orders) parsed.orders = [];
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
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 150));
      return saveDB(data, retries - 1);
    }
    throw error;
  }
}

export async function placeOrder(cart: any[], address: string, totalAmount: number) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return { success: false, message: "User not found" };

    const newOrder = {
      id: "order-" + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      address,
      items: cart,
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    if (!db.orders) db.orders = [];
    db.orders.push(newOrder);

    // Update user stats
    user.totalItemsBought = (user.totalItemsBought || 0) + cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    user.totalSpent = (user.totalSpent || 0) + totalAmount;

    // Clear user's cart
    if (db.carts && db.carts[userId]) {
      db.carts[userId] = [];
    }

    await saveDB(db);

    // Notify Admin
    const adminEmail = db.admin?.email || process.env.EMAIL_USER;
    const adminPhone = db.admin?.whatsapp;

    if (adminPhone) {
      console.log(`[NOTIFICATION SYSTEM] Sending SMS/WhatsApp to Admin (${adminPhone}): New Order ${newOrder.id} placed by ${user.name} for ₹${totalAmount}.`);
    }

    try {
      const EMAIL_USER = process.env.EMAIL_USER;
      const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD;

      if (EMAIL_USER && EMAIL_PASS && adminEmail) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"PickNwear Orders" <${EMAIL_USER}>`,
          to: adminEmail,
          subject: `New Order Received - ${newOrder.id}`,
          html: `
            <h3>New Order from ${user.name}</h3>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Items:</strong> ${cart.map((item: any) => item.quantity + 'x ' + item.name).join(', ')}</p>
            <p>Check the admin dashboard for details.</p>
          `
        });
        console.log(`[NOTIFICATION SYSTEM] Email sent to Admin (${adminEmail}) for order ${newOrder.id}.`);
      }
    } catch (e) {
      console.error("Failed to send admin notification email", e);
    }

    return { success: true, orderId: newOrder.id };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserPastOrders() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) return { success: false, message: "Not logged in" };

    const db = await getDB();
    const userOrders = (db.orders || []).filter((o: any) => o.userId === userId);
    
    // Sort descending by date
    userOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, orders: userOrders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
