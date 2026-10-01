const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'prisma', 'schema.prisma');
let content = fs.readFileSync(fp, 'utf8');

if (!content.includes('model CartItem')) {
  // We need to add cartItems to User model as well to satisfy Prisma relation
  content = content.replace('orders       Order[]', 'orders       Order[]\n  cartItems    CartItem[]');
  content += `\n
model CartItem {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  fs.writeFileSync(fp, content);
  console.log("Updated schema.prisma");
} else {
  console.log("CartItem already exists");
}
