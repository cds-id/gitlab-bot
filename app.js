const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const gitlabWebhook = require('./routes/gitlabWebhook');
const linearWebhook = require('./routes/linearWebhook');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Linear webhook is mounted before the global JSON parser so its router
// can capture the raw body for HMAC signature verification.
app.use('/api/webhook', linearWebhook);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/webhook', gitlabWebhook);

// Simple health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'GitLab WebHook Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
