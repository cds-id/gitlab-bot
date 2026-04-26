const crypto = require('node:crypto');
const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const { formatLinearEvent } = require('../utils/linearFormatter');

const REPLAY_WINDOW_MS = 60 * 1000;

// JSON parser that captures the raw body so we can verify the HMAC signature.
const jsonParser = express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
});

const verifySignature = (headerSignatureString, rawBody) => {
  const secret = process.env.LINEAR_WEBHOOK_SECRET;
  if (!secret || typeof headerSignatureString !== 'string' || !rawBody) {
    return false;
  }
  const headerSignature = Buffer.from(headerSignatureString, 'hex');
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest();
  if (computedSignature.length !== headerSignature.length) {
    return false;
  }
  return crypto.timingSafeEqual(computedSignature, headerSignature);
};

/**
 * Linear webhook endpoint
 * Receives events from Linear and forwards them to a separate WhatsApp group.
 * Configure target group via WHATSAPP_LINEAR_GROUP_ID env var
 * and signing secret via LINEAR_WEBHOOK_SECRET.
 *
 * Docs: https://linear.app/developers/webhooks
 */
router.post('/linear', jsonParser, async (req, res) => {
  if (!process.env.LINEAR_WEBHOOK_SECRET) {
    console.error('LINEAR_WEBHOOK_SECRET is not set');
    return res.sendStatus(500);
  }

  if (!verifySignature(req.get('linear-signature'), req.rawBody)) {
    console.warn('Rejected Linear webhook: invalid signature');
    return res.sendStatus(401);
  }

  if (!req.body?.webhookTimestamp ||
      Math.abs(Date.now() - req.body.webhookTimestamp) > REPLAY_WINDOW_MS) {
    console.warn('Rejected Linear webhook: timestamp outside replay window');
    return res.sendStatus(401);
  }

  try {
    const payload = req.body;
    const { action, type } = payload;

    if (!action || !type) {
      console.log('Ignoring Linear webhook with missing action/type');
      return res.sendStatus(200);
    }

    const supportedTypes = ['Issue', 'Comment', 'Project', 'ProjectUpdate'];
    if (!supportedTypes.includes(type)) {
      console.log(`Ignoring unsupported Linear event type: ${type}`);
      return res.sendStatus(200);
    }

    const groupId = process.env.WHATSAPP_LINEAR_GROUP_ID;
    if (!groupId) {
      console.warn('WHATSAPP_LINEAR_GROUP_ID is not set; Linear events have no destination');
      return res.sendStatus(200);
    }

    const message = formatLinearEvent(payload);
    await sendWhatsAppMessage(message, groupId);

    console.log(`Sent Linear notification for ${type} ${action}`);
    return res.sendStatus(200);
  } catch (error) {
    console.error('Error processing Linear webhook:', error);
    // 500 prompts Linear to retry the delivery later.
    return res.sendStatus(500);
  }
});

module.exports = router;
