"use server";

import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import prisma from "@/lib/prisma";

export async function createOrder(orderData: any) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;

    const orderNumber = "ORD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    
    // Create the order with its items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        total: orderData.total,
        paymentMethod: orderData.paymentMethod,
        address: orderData.address,
        phone: orderData.phone || "",
        customerName: orderData.firstName + " " + orderData.lastName,
        customerEmail: orderData.email,
        items: {
          create: orderData.items.map((item: any) => ({
            productId: item.productId || "unknown", // Fallback if local product doesn't exist in DB
            quantity: item.quantity,
            price: item.price,
            size: item.size || null
          }))
        }
      },
      include: {
        items: true
      }
    });

    // Clear cart if logged in
    if (userId) {
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
    }

    // Attempt to send email
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD;

    if (EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
          }
        });

        await transporter.sendMail({
          from: `"PickNwear" <${EMAIL_USER}>`,
          to: orderData.email,
          subject: `Order Confirmation - ${orderNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Thank you for your order, ${orderData.firstName}!</h2>
              <p>Your order <strong>${orderNumber}</strong> has been received and is being processed.</p>
              <h3>Order Total: Rs ${orderData.total.toLocaleString()}</h3>
              <p>Payment Method: ${orderData.paymentMethod}</p>
              <br/>
              <p>We will notify you when it ships!</p>
            </div>
          `
        });
      } catch (e) {
        console.warn("Failed to send email", e);
      }
    }

    return { success: true, orderId: order.orderNumber };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserOrders() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) return { success: false, message: "Not logged in" };

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    return { success: true, orders };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getOrder(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) return { success: false, message: "Order not found" };

    return { success: true, order };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
