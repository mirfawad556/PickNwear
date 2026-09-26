"use server";
import nodemailer from 'nodemailer';

import fs from 'fs/promises';
import { existsSync, copyFileSync } from 'fs';
import os from 'os';
import path from 'path';
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

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
    if (!parsed.users) {
      parsed.users = [];
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

export async function signupUser(name: string, email: string, pass: string) {
  try {
    const db = await getDB();
    const existing = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { success: false, message: "Email already registered." };

    const hashedPassword = await bcrypt.hash(pass, 10);
    const newUser = {
      id: "user-" + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await saveDB(db);

    const cookieStore = await cookies();
    cookieStore.set("user_session", newUser.id, { secure: true, httpOnly: true });

    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function loginUser(email: string, pass: string) {
  try {
    const db = await getDB();
    const user = db.users.find((u: any) => u.email === email.toLowerCase());
    
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

    const db = await getDB();
    const user = db.users.find((u: any) => u.id === userId);
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

    const db = await getDB();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) return { success: false, message: "User not found" };

    user.address = address;
    await saveDB(db);

    return { success: true, address: user.address };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function mockSendResetEmail(email: string) {
  try {
    const db = await getDB();
    const user = db.users.find((u: any) => u.email === email.toLowerCase());
    if (!user) return { success: false, message: "Email not found." };
    
    // Generate secure token
    const resetToken = "reset-" + user.id + "-" + Date.now();
    
    // Store token in DB
    user.resetToken = resetToken;
    await saveDB(db);

    // Prepare real email transport
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_APP_PASSWORD;

    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new Error("SMTP credentials missing. Please add EMAIL_USER and EMAIL_APP_PASSWORD to your .env file in the root of the web folder.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });

    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"PickNwear Support" <${EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - PickNwear",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
          <h2 style="color: #000; font-size: 24px; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; margin-bottom: 30px;">Hi ${user.name}, you recently requested to reset your password for your PickNwear account. Click the button below to proceed.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Reset Password</a>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    return { success: true, token: resetToken };
  } catch (error: any) {
    console.error("Email Error:", error);
    return { success: false, message: error.message };
  }
}

export async function resetPassword(token: string, newPass: string) {
  try {
    const db = await getDB();
    const user = db.users.find((u: any) => u.resetToken === token);
    
    if (!user) return { success: false, message: "Invalid or expired token." };

    user.password = await bcrypt.hash(newPass, 10);
    delete user.resetToken;
    await saveDB(db);

    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
