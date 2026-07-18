const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_IDS = (import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID || '')
  .split(',')
  .map(id => id.trim())
  .filter(id => id);

export async function sendQuoteToTelegram(data: {
  full_name: string;
  phone: string;
  email: string;
  service_required: string;
  budget: string;
  custom_budget: string;
  message: string;
}, attachmentUrls?: string[]) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_CHAT_IDS.length === 0) {
    console.warn('[Telegram] Missing VITE_TELEGRAM_BOT_TOKEN or VITE_TELEGRAM_ADMIN_CHAT_ID in .env');
    return;
  }

  const actualBudget = data.budget === 'Custom Budget' && data.custom_budget ? data.custom_budget : data.budget;
  const projectDesc = data.message ? data.message.trim() : 'None';
  const hasAttachments = attachmentUrls && attachmentUrls.length > 0;

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
    '\u{1F4CE} Attachments: ' + (hasAttachments ? attachmentUrls.length + ' photo(s)' : 'None'),
    '',
    '\u{1F4C5} Submitted: ' + new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' }) + ' (UK)',
  ];

  const text = lines.join('\n');

  for (const chatId of TELEGRAM_CHAT_IDS) {
    try {
      // Send the text message
      const msgUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
      const res = await fetch(msgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      const json = await res.json();
      if (json.ok) {
        console.log(`[Telegram] Quote notification sent successfully to ${chatId}`);
      } else {
        console.error(`[Telegram] API error for ${chatId}:`, json);
      }

      // Send each attached image as a photo
      if (hasAttachments) {
        const photoUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendPhoto';
        for (let i = 0; i < attachmentUrls.length; i++) {
          const url = attachmentUrls[i];
          // Only send image types via sendPhoto (skip PDFs, etc.)
          const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
          if (isImage) {
            try {
              const caption = '\u{1F4F7} Photo ' + (i + 1) + ' of ' + attachmentUrls.length + ' — ' + data.full_name;
              const photoRes = await fetch(photoUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: url,
                  caption,
                }),
              });
              const photoJson = await photoRes.json();
              if (photoJson.ok) {
                console.log(`[Telegram] Photo ` + (i + 1) + ` sent successfully to ${chatId}`);
              } else {
                console.error(`[Telegram] Photo send error for ${chatId}:`, photoJson);
              }
            } catch (photoErr) {
              console.error(`[Telegram] Photo send network error for ${chatId}:`, photoErr);
            }
          } else {
            // For non-image files (PDF), send as document
            try {
              const docUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendDocument';
              const caption = '\u{1F4C4} Document ' + (i + 1) + ' of ' + attachmentUrls.length + ' — ' + data.full_name;
              const docRes = await fetch(docUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  document: url,
                  caption,
                }),
              });
              const docJson = await docRes.json();
              if (docJson.ok) {
                console.log(`[Telegram] Document ` + (i + 1) + ` sent successfully to ${chatId}`);
              } else {
                console.error(`[Telegram] Document send error for ${chatId}:`, docJson);
              }
            } catch (docErr) {
              console.error(`[Telegram] Document send network error for ${chatId}:`, docErr);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[Telegram] Network error for chat ${chatId}:`, err);
    }
  }
}

