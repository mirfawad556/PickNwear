"use server";
import { cookies } from 'next/headers';
import prisma from "@/lib/prisma";

async function getUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("user_session")?.value;
}

export async function getCart() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'asc' }
    });

    const cart = cartItems.map(item => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }));

    return { success: true, cart };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function addToCart(product: any) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    const existingItem = await prisma.cartItem.findFirst({
      where: { userId, productId: product.id }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + 1 }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          productId: product.id,
          quantity: 1
        }
      });
    }

    return await getCart();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function removeFromCart(cartItemId: string) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    await prisma.cartItem.deleteMany({
      where: { id: cartItemId, userId }
    });
    
    return await getCart();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    await prisma.cartItem.updateMany({
      where: { id: cartItemId, userId },
      data: { quantity }
    });
    
    return await getCart();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function clearCart() {
  try {
    const userId = await getUserId();
    if (!userId) return { success: false, message: "Not logged in" };

    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
