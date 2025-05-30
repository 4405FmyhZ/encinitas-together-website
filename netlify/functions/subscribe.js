// netlify/functions/subscribe.js
// This Netlify Function proxies subscription requests to Mailchimp to hide your API key

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required.' }) };
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g. 'us8'

  const url = `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/`;
  const data = {
    email_address: email,
    status: 'subscribed'
  };

  const options = {
    method: 'POST',
    headers: {
      'Authorization': `apikey ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (response.status === 200 || response.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ message: 'Subscribed!' }) };
    }
    return { statusCode: response.status, body: JSON.stringify({ error: result.detail || 'Subscription failed.' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
