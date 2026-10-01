"use server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function signupUser(name: string, email: string, pass: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return { success: false, message: "Email already registered." };

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      }
    });

    const cookieStore = await cookies();
    cookieStore.set("user_session", newUser.id, { secure: true, httpOnly: true });

    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function loginUser(email: string, pass: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { success: false, message: "User not found." };

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) return { success: false, message: "Incorrect password.", isWrongPassword: true };

    const cookieStore = await cookies();
    cookieStore.set("user_session", user.id, { secure: true, httpOnly: true });

    return { success: true, user: { id: user.id, name: user.name, email: user.email } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function checkUserSession() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      cookieStore.delete("user_session");
      return null;
    }
    return { id: user.id, name: user.name, email: user.email, address: user.address };
  } catch (error) {
    return null;
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("user_session");
  return { success: true };
}

export async function updateUserAddress(address: string) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_session")?.value;
    if (!userId) return { success: false, message: "Not logged in" };

    const user = await prisma.user.update({
      where: { id: userId },
      data: { address }
    });

    return { success: true, address: user.address };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function mockSendResetEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { success: false, message: "Email not found." };
    
    const resetToken = "reset-" + user.id + "-" + Date.now();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetCode: resetToken }
    });

    return { success: true, token: resetToken, message: "Simulated reset email sent." };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function resetPassword(token: string, newPass: string) {
  try {
    const user = await prisma.user.findFirst({ where: { resetCode: token } });
    if (!user) return { success: false, message: "Invalid or expired token." };

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetCode: null }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
