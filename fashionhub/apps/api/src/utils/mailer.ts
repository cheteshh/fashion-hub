import nodemailer from 'nodemailer';

// Generate standard transporter for standard mailers using generic placeholders from ENV
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'ethereal_user',
    pass: process.env.SMTP_PASS || 'ethereal_pass'
  }
});

export const sendPriceAlertEmail = async (to: string, productName: string, droppedPrice: number, targetPrice: number, url: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"FashionHub Alerts" <${process.env.SMTP_USER || 'alerts@fashionhub.com'}>`,
      to,
      subject: `Price Drop Alert: ${productName}`,
      html: `
        <h2>Great news!</h2>
        <p>The price for <strong>${productName}</strong> has dropped below your target price of ₹${targetPrice}.</p>
        <p>Current Price: <strong>₹${droppedPrice}</strong></p>
        <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Buy Now</a></p>
      `
    });
    console.log('Price alert sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending price alert email:', error);
    return false;
  }
};
