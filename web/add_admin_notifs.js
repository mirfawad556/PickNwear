const fs = require('fs');
const path = require('path');

const fp = path.join(process.cwd(), 'src', 'app', 'actions', 'order.ts');
let content = fs.readFileSync(fp, 'utf8');

const target = `      if (EMAIL_USER && EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: EMAIL_USER,
              pass: EMAIL_PASS
            }
          });

          await transporter.sendMail({
            from: \`"PickNwear" <\${EMAIL_USER}>\`,
            to: orderData.email,
            subject: \`Order Confirmation - \${orderNumber}\`,
            html: \`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for your order, \${orderData.firstName}!</h2>
                <p>Your order <strong>\${orderNumber}</strong> has been received and is being processed.</p>
                <h3>Order Total: Rs \${orderData.total.toLocaleString()}</h3>
                <p>Payment Method: \${orderData.paymentMethod}</p>
                <br/>
                <p>We will notify you when it ships!</p>
              </div>
            \`
          });
        } catch (e) {
          console.warn("Failed to send email", e);
        }`;

const replacement = `      if (EMAIL_USER && EMAIL_PASS) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: EMAIL_USER,
              pass: EMAIL_PASS
            }
          });

          // Email to customer
          await transporter.sendMail({
            from: \`"PickNwear" <\${EMAIL_USER}>\`,
            to: orderData.email,
            subject: \`Order Confirmation - \${orderNumber}\`,
            html: \`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for your order, \${orderData.firstName}!</h2>
                <p>Your order <strong>\${orderNumber}</strong> has been received and is being processed.</p>
                <h3>Order Total: Rs \${orderData.total.toLocaleString()}</h3>
                <p>Payment Method: \${orderData.paymentMethod}</p>
                <br/>
                <p>We will notify you when it ships!</p>
              </div>
            \`
          });

          // Email to Admin
          await transporter.sendMail({
            from: \`"PickNwear System" <\${EMAIL_USER}>\`,
            to: EMAIL_USER, // Admin receives it at the support email
            subject: \`NEW ORDER RECEIVED - \${orderNumber}\`,
            html: \`
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #e53e3e;">New Order Alert!</h2>
                <p><strong>Order Number:</strong> \${orderNumber}</p>
                <p><strong>Customer:</strong> \${orderData.firstName} \${orderData.lastName}</p>
                <p><strong>Email:</strong> \${orderData.email}</p>
                <p><strong>Phone:</strong> \${orderData.phone}</p>
                <p><strong>Address:</strong> \${orderData.address}</p>
                <p><strong>Total:</strong> Rs \${orderData.total.toLocaleString()}</p>
                <p><strong>Payment:</strong> \${orderData.paymentMethod}</p>
                <hr />
                <h3>Items:</h3>
                <ul>
                  \${orderData.items.map((item: any) => \`<li>\${item.quantity}x \${item.name || item.productId} - Rs \${item.price}</li>\`).join('')}
                </ul>
              </div>
            \`
          });

          // Simulated WhatsApp logging
          console.log(\`\n================================\nWHATSAPP NOTIFICATION SENT TO ADMIN\nOrder: \${orderNumber}\nTotal: Rs \${orderData.total}\n================================\n\`);
          
        } catch (e) {
          console.warn("Failed to send email", e);
        }`;

if (content.includes("from: `\"PickNwear\" <${EMAIL_USER}>`,")) {
  content = content.replace(target, replacement);
  fs.writeFileSync(fp, content);
  console.log("Added admin notifications");
} else {
  console.log("Target not found");
}
