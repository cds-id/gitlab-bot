const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const gitlabWebhook = require('./routes/gitlabWebhook');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

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
