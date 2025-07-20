import { generateDiscountCode } from "./common";

// Email templates
export function generateWelcomeHTML(data: { name: string; plan: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #3B82F6; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Zosmed Waiting List! 🎉</h1>
        </div>
        
        <p>Hi ${data.name},</p>
        
        <p>Terima kasih telah mendaftar di waiting list Zosmed!</p>
        
        <p>Anda telah memilih plan: <strong>${getPlanDisplayName(data.plan)}</strong></p>
        
        <p>Sebagai early adopter, Anda akan mendapatkan:</p>
        <ul>
          <li>🎁 Diskon 50% untuk 3 bulan pertama</li>
          <li>🚀 Akses prioritas saat launch</li>
          <li>💬 Direct support dari founder</li>
        </ul>
        
        <p>Kami akan segera menghubungi Anda begitu Zosmed siap diluncurkan!</p>
        
        <p>Best regards,<br>
        Tim Zosmed</p>
      </div>
    </body>
    </html>
  `;
}

export function generateLaunchHTML(user: any): string {
  const discountCode = user.discountCode;
  const planName = getPlanDisplayName(user.interestedPlan);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .button { 
          display: inline-block; 
          padding: 12px 30px; 
          background: #3B82F6; 
          color: white; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .discount-box { 
          background: #FEF3C7; 
          border: 2px dashed #F59E0B; 
          padding: 20px; 
          margin: 20px 0; 
          text-align: center;
          border-radius: 8px;
        }
        .discount-code { 
          font-size: 24px; 
          font-weight: bold; 
          color: #D97706; 
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Zosmed Sudah Diluncurkan!</h1>
        </div>
        
        <p>Halo ${user.name},</p>
        
        <p>Kabar gembira! Zosmed sudah resmi diluncurkan!</p>
        
        <div class="discount-box">
          <p><strong>DISKON 50% untuk 3 bulan pertama!</strong></p>
          <p>Gunakan kode:</p>
          <div class="discount-code">${discountCode}</div>
          <p>Plan pilihan Anda: <strong>${planName}</strong></p>
        </div>
        
        <center>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/register?code=${discountCode}" class="button">
            Aktivasi Akun Sekarang
          </a>
        </center>
        
        <p><strong>⏰ Penting:</strong> Kode diskon ini hanya berlaku selama 7 hari!</p>
        
        <p>Salam sukses,<br>
        Tim Zosmed</p>
      </div>
    </body>
    </html>
  `;
}


function getPlanDisplayName(plan: string): string {
  const planNames: Record<string, string> = {
    FREE: "Free Plan",
    STARTER: "Starter Plan - Rp 99k/bulan",
    PRO: "Pro Plan - Rp 199k/bulan",
  };
  return planNames[plan] || plan;
}