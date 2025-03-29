const axios = require('axios');

async function fetchEmails() {
  try {
    const mailHogApiUrl =
      process.env.MAILHOG_API || 'http://mailhog:8025/api/v2/messages';

    console.log('🔍 MAILHOG_API:', mailHogApiUrl);

    const response = await axios.get(mailHogApiUrl);

    if (
      !response.data ||
      !response.data.items ||
      response.data.items.length === 0
    ) {
      console.warn('📭 No new emails found.');
      return [];
    }

    console.log(`📩 Received ${response.data.items.length} emails.`);

    return response.data.items.map((msg) => ({
      from: msg.Content.Headers.From?.[0] || 'Unknown Sender',
      to: msg.Content.Headers.To?.[0] || 'Unknown Recipient',
      subject: msg.Content.Headers.Subject?.[0] || '(No Subject)',
      date: msg.Content.Headers.Date?.[0] || 'Unknown Date',
      body: msg.Content.Body || 'No content available',
    }));
  } catch (error) {
    console.error('❌ Error fetching emails:', error.message);
    if (error.response) {
      console.error('🔻 HTTP Status:', error.response.status);
    }
    return { error: 'Failed to fetch emails' };
  }
}

module.exports = { fetchEmails };
