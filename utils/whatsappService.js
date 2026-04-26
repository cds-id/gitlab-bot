const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Send a message to a WhatsApp group
 *
 * @param {string} message - The message to send
 * @param {string} [groupId] - Target WhatsApp group ID. Defaults to WHATSAPP_GROUP_ID env var.
 * @returns {Promise<object>} - Response from the WhatsApp API
 */
const sendWhatsAppMessage = async (message, groupId) => {
  try {
    const response = await axios({
      method: 'post',
      url: process.env.WHATSAPP_API_URL,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': process.env.WHATSAPP_API_AUTH,
        'x-device-id': process.env.WHATSAPP_DEVICE_ID
      },
      data: {
        phone: groupId || process.env.WHATSAPP_GROUP_ID,
        message: message
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage
};
