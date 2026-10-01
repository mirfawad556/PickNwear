const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const LOCAL_DB = path.join(process.cwd(), 'local-db.json');
  if (!fs.existsSync(LOCAL_DB)) {
    console.log("No local-db.json found.");
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(LOCAL_DB, 'utf8'));

  if (data.admin) {
    const adminExists = await prisma.admin.findUnique({ where: { username: data.admin.username } });
    if (!adminExists) {
      await prisma.admin.create({
        data: {
          username: data.admin.username,
          password: data.admin.password,
          isFirstLogin: data.admin.isFirstLogin,
          whatsapp: data.admin.whatsapp
        }
      });
      console.log("Admin migrated.");
    }
  }

  if (data.users && data.users.length > 0) {
    for (const u of data.users) {
      const userExists = await prisma.user.findUnique({ where: { email: u.email } });
      if (!userExists) {
        await prisma.user.create({
          data: {
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            address: u.address,
            createdAt: new Date(u.createdAt)
          }
        });
      }
    }
    console.log("Users migrated.");
  }

  if (data.products && data.products.length > 0) {
    for (const p of data.products) {
      const prodExists = await prisma.product.findUnique({ where: { id: p.id } });
      if (!prodExists) {
        await prisma.product.create({
          data: {
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            description: p.description || "",
            discountPercent: Number(p.discountPercent) || 0,
            specialOffers: p.specialOffers || "",
            clothingType: p.clothingType || "",
            colors: p.colors || "",
            category: p.category || "Male",
            image: p.image || "",
            createdAt: p.createdAt ? new Date(p.createdAt) : new Date()
          }
        });
      }
    }
    console.log("Products migrated.");
  }

  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
