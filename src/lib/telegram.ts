export async function sendQuoteToTelegram(data: {
  full_name: string;
  phone: string;
  email: string;
  service_required: string;
  budget: string;
  custom_budget: string;
  message: string;
}, attachmentUrls?: string[]) {
  const response = await fetch('/api/send-telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, attachmentUrls }),
  });

  if (!response.ok) {
    throw new Error('Telegram notification failed');
  }
}
