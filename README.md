# GitLab Webhook to WhatsApp Notification Service

This service listens for GitLab webhook events and forwards notifications to a WhatsApp group when commits with Jira card references are detected, when pipeline statuses change, or when merge requests are updated.

## Features

- Receives GitLab webhook events (push events, pipeline events, and merge request events)
- Parses commit messages for conventional commit format `type(JIRA-123) message`
- Forwards matching commits to a WhatsApp group with rich formatting
- Notifies about pipeline status changes (success, failure, cancellation)
- Tracks merge request lifecycle (open, merge, close, approve)
- Links directly to Jira cards and GitLab resources
- Includes emoji indicators for different event types and statuses
- Simple REST API architecture

## Prerequisites

- Node.js v20 or higher
- npm
- GitLab repository with webhook configuration

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env` and update values)
4. Start the server:
   ```
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `WHATSAPP_GROUP_ID`: WhatsApp group ID to send notifications to
- `WHATSAPP_API_URL`: URL of WhatsApp API endpoint
- `WHATSAPP_API_AUTH`: Authorization header for WhatsApp API
- `JIRA_URL`: Your Jira instance URL (for creating links to Jira cards)

## GitLab Webhook Configuration

1. Go to your GitLab repository
2. Navigate to Settings > Webhooks
3. Add a new webhook with the URL: `http://your-server:3000/api/webhook/gitlab`
4. Select "Push events", "Pipeline events", and "Merge request events" triggers
5. Save the webhook

## Notification Logic

### Push Events
- Parses commit messages looking for pattern: `type(JIRA-123) message`
- Sends WhatsApp notification for commits that match this pattern
- Includes commit details, author, type, Jira reference, and URL

### Pipeline Events
- Notifications for pipeline statuses: success, failed, or canceled
- Always notifies on failed pipelines, regardless of Jira reference
- For successful or canceled pipelines, only notifies if associated commit has a Jira reference
- Includes pipeline details, project, branch, duration, and URL

### Merge Request Events
- Notifications for important MR actions: open, merge, close, reopen, approved, unapproved
- Always notifies on new, merged, or approved MRs
- For other actions, only notifies if MR title or description contains a Jira reference
- Extracts Jira references from both title (conventional format) and description (any format)
- Includes MR details, author, branches, labels, and URL

## Message Format

Messages are formatted with emojis and markdown formatting to improve readability:

- Commit types have corresponding emojis (e.g., ✨ for feature, 🐛 for fix)
- Pipeline statuses are visually indicated (✅ for success, ❌ for failure)
- Merge request actions have distinct indicators (🟢 for open, 🔀 for merge)
- Important information is highlighted in bold
- Code elements are formatted as monospace text

## Testing

Several test scripts are provided to help you test different aspects of the service:

```
# Test the message parser component
npm run test:parser

# Test the WhatsApp notification service directly
npm run test:whatsapp

# Simulate GitLab push webhook events
npm run test:webhook

# Simulate GitLab pipeline webhook events
npm run test:pipeline

# Simulate GitLab merge request webhook events
npm run test:merge
```

## Development

Start the server in development mode:

```
npm run dev
```

## License

ISC
