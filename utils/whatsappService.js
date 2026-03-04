const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Send a message to the configured WhatsApp group
 * 
 * @param {string} message - The message to send
 * @returns {Promise<object>} - Response from the WhatsApp API
 */
const sendWhatsAppMessage = async (message) => {
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
        phone: process.env.WHATSAPP_GROUP_ID,
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
