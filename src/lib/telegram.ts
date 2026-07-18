const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID || '';

export async function sendQuoteToTelegram(data: {
  full_name: string;
  phone: string;
  email: string;
  service_required: string;
  budget: string;
  custom_budget: string;
  message: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Missing VITE_TELEGRAM_BOT_TOKEN or VITE_TELEGRAM_ADMIN_CHAT_ID in .env');
    return;
  }

  const actualBudget = data.budget === 'Custom Budget' && data.custom_budget ? data.custom_budget : data.budget;
  const projectDesc = data.message ? data.message.trim() : 'None';

  const lines = [
    '\u{1F514} New Quote Request! \u{1F514}',
    '',
    '\u{1F464} Name: ' + data.full_name,
    '\u{1F4DE} Phone: ' + data.phone,
    '\u{2709}\u{FE0F} Email: ' + (data.email || 'Not Provided'),
    '',
    '\u{1F6E0} Service: ' + data.service_required,
    '\u{1F4B0} Budget: ' + actualBudget,
    '',
    '\u{1F4DD} Project Description:',
    projectDesc,
    '',
    '\u{1F4C5} Submitted: ' + new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' (UK)',
  ];

  const text = lines.join('\n');

  try {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
    });
    const json = await res.json();
    if (json.ok) {
      console.log('[Telegram] Quote notification sent successfully');
    } else {
      console.error('[Telegram] API error:', json);
    }
  } catch (err) {
    console.error('[Telegram] Network error:', err);
  }
}
