// netlify/functions/subscribe.js
// Netlify Function to proxy subscription requests to Mailchimp without external dependencies

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) };
  }

  const { email } = payload;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
  }

  // Read Mailchimp config from environment
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g. 'us8'

  if (!API_KEY || !LIST_ID || !SERVER_PREFIX) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Mailchimp configuration missing.' }) };
  }

  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;
  const data = {
    email_address: email,
    status: 'subscribed'
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Subscribed!' }) };
    }
    return { statusCode: response.status, body: JSON.stringify({ error: result.detail || 'Subscription failed.' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
