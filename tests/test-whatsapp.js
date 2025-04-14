/**
 * WhatsApp Service Test Script
 * 
 * This script tests the WhatsApp notification service directly
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the project root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import the WhatsApp service
const { sendWhatsAppMessage } = require('../utils/whatsappService');

/**
 * Test the WhatsApp notification service
 */
const testWhatsAppService = async () => {
  console.log('=== WHATSAPP SERVICE TEST ===');
  console.log(`WhatsApp Group ID: ${process.env.WHATSAPP_GROUP_ID}`);
  
  // Test message
  const testMessage = `
*GitLab Bot - WhatsApp Test*

This is a test message from the GitLab Bot.
If you can see this message, the WhatsApp integration is working correctly.

*Timestamp:* ${new Date().toISOString()}
*Environment:* Test
  `;
  
  console.log('\n📤 Sending test message...');
  console.log('-'.repeat(40));
  console.log(testMessage);
  console.log('-'.repeat(40));
  
  try {
    const response = await sendWhatsAppMessage(testMessage);
    console.log('\n✅ Message sent successfully!');
    console.log(`Response: ${JSON.stringify(response, null, 2)}`);
  } catch (error) {
    console.error('\n❌ Failed to send message:');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
};

// Run the test
testWhatsAppService();
