"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import fs from 'fs/promises';
import path from 'path';

export async function addProduct(productData: any) {
  try {
    let imageUrl = productData.image;

    // Store base64 string directly in Supabase to avoid Vercel read-only errors
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = productData.image; 
    }

    const newProduct = await prisma.product.create({
      data: {
        name: productData.name,
        price: Number(productData.price) || 0,
        description: productData.description || "",
        discountPercent: Number(productData.discountPercent) || 0,
        specialOffers: productData.specialOffers || "",
        clothingType: productData.clothingType || "",
        colors: productData.colors || "",
        category: productData.category || "Male",
        image: imageUrl || "",
      }
    });
    
    revalidatePath('/collections');
    revalidatePath('/admin');
    
    return { success: true, product: newProduct };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to add product" };
  }
}

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, products };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath('/collections');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete product" };
  }
}

export async function updateProduct(productId: string, productData: any) {
  try {
    let imageUrl = productData.image;
    // Store base64 string directly in Supabase to avoid Vercel read-only errors
    if (imageUrl && imageUrl.startsWith('data:image')) {
      imageUrl = productData.image;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: productData.name,
        price: productData.price !== undefined ? Number(productData.price) : undefined,
        description: productData.description,
        discountPercent: productData.discountPercent !== undefined ? Number(productData.discountPercent) : undefined,
        specialOffers: productData.specialOffers,
        clothingType: productData.clothingType,
        colors: productData.colors,
        category: productData.category,
        image: imageUrl !== undefined ? imageUrl : undefined,
      }
    });
    
    revalidatePath('/collections');
    revalidatePath('/admin');
    return { success: true, product: updatedProduct };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to update product" };
  }
}

export async function loginAdmin(username: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });

    if (!admin) {
      return { success: false, message: "Invalid credentials." };
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return { success: false, message: "Invalid credentials." };
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        username: newUsername,
        password: hashedPassword,
        whatsapp,
        isFirstLogin: false
      }
    });

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
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (admin && !admin.isFirstLogin) {
      return adminId;
    }
    
    cookieStore.delete("admin_session");
    return null;
  } catch (error) {
    cookieStore.delete("admin_session");
    return null;
  }
}

export async function getAllUsers() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin_session")?.value;
    if (!adminId) return { success: false, message: "Unauthorized" };

    const users = await prisma.user.findMany({
      include: {
        orders: {
          include: { items: true }
        }
      }
    });
    
    const safeUsers = users.map((u: any) => {
      const purchasedItems = u.orders.flatMap((o: any) => o.items);
      const totalItemsBought = purchasedItems.reduce((acc: number, item: any) => acc + item.quantity, 0);
      const totalSpent = u.orders.reduce((acc: number, o: any) => acc + o.total, 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address || "No address provided",
        createdAt: u.createdAt,
        totalItemsBought,
        totalSpent,
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
    const admin = await prisma.admin.findFirst();
    const whatsapp = admin?.whatsapp || "+1 (555) 123-4567";
    const email = admin?.email || "support@picknwear.com";
    const phone = admin?.phone || "+1 (555) 987-6543"; 
    
    return { success: true, contact: { whatsapp, email, phone } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
