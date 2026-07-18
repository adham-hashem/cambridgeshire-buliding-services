// Vercel serverless function to securely send quote requests to Telegram.
// Avoids exposing bot credentials to the client.

// Helper to escape HTML tags for Telegram parse_mode: 'HTML'
function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramNotification(message: string, attempt = 1, maxAttempts = 3) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.log('[Telegram Notifier] Bot Token or Chat ID not configured. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status} - ${errText}`);
    }

    const resData: any = await response.json();
    if (!resData.ok) {
      throw new Error(`API responded with ok=false: ${JSON.stringify(resData)}`);
    }

    console.log('[Telegram Notifier] Notification sent successfully.');
  } catch (error: any) {
    console.error(`[Telegram Notifier] Error (Attempt ${attempt}/${maxAttempts}):`, error.message || error);

    if (attempt < maxAttempts) {
      const delay = attempt * 2000;
      console.log(`[Telegram Notifier] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendTelegramNotification(message, attempt + 1, maxAttempts);
    } else {
      console.error('[Telegram Notifier] Max attempts reached. Notification failed.');
    }
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const data = req.body;

    const fullName = escapeHtml(data.full_name);
    const phone = escapeHtml(data.phone);
    const email = escapeHtml(data.email) || 'Not Provided';
    const serviceRequired = escapeHtml(data.service_required);
    const budget = escapeHtml(data.budget);
    const customBudget = data.custom_budget ? escapeHtml(data.custom_budget) : null;
    const messageText = data.message ? escapeHtml(data.message.trim()) : 'None';

    const actualBudget = budget === 'Custom Budget' && customBudget ? customBudget : budget;

    const message = `🔔 <b>New Quote Request!</b> 🔔\n\n` +
                    `👤 <b>Name:</b> ${fullName}\n` +
                    `📞 <b>Phone:</b> ${phone}\n` +
                    `✉️ <b>Email:</b> ${email}\n\n` +
                    `🛠 <b>Service:</b> ${serviceRequired}\n` +
                    `💰 <b>Budget:</b> ${actualBudget}\n\n` +
                    `📝 <b>Project Description:</b>\n${messageText}\n\n` +
                    `📅 <i>Submitted at: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} (UK Time)</i>`;

    await sendTelegramNotification(message);

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Telegram API handler] Error:', error.message || error);
    return res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
}
