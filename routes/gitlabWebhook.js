const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const { parseCommitMessage } = require('../utils/messageParser');
const { formatPipelineMessage, formatCommitMessage, formatMergeRequestMessage } = require('../utils/messageFormatter');

/**
 * GitLab webhook endpoint for commit events
 * Receives push events from GitLab and processes them
 */
router.post('/gitlab', async (req, res) => {
  try {
    const { object_kind } = req.body;
    
    // Handle different event types
    switch (object_kind) {
      case 'push':
        await handlePushEvent(req.body);
        break;
      case 'pipeline':
        await handlePipelineEvent(req.body);
        break;
      case 'merge_request':
        await handleMergeRequestEvent(req.body);
        break;
      default:
        console.log(`Ignoring unsupported event type: ${object_kind}`);
    }
    
    return res.status(200).json({ status: 'success', message: 'Processed webhook' });
  } catch (error) {
    console.error('Error processing GitLab webhook:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

/**
 * Handles push events containing commits
 */
const handlePushEvent = async (payload) => {
  const { commits, user_name, project, repository } = payload;
  
  if (!commits || commits.length === 0) {
    console.log('No commits found in push event');
    return;
  }
  
  console.log(`Received ${commits.length} commits from GitLab`);
  
  // Process each commit
  for (const commit of commits) {
    const { id, message, author, url } = commit;
    
    // Parse the commit message to extract Jira card info
    const parsedInfo = parseCommitMessage(message);
    
    // Format the message for WhatsApp
    const whatsAppMessage = formatCommitMessage({
      id,
      author,
      project: project || repository,
      type: parsedInfo.type,
      jiraCard: parsedInfo.jiraCard,
      message: parsedInfo.cleanMessage || message,
      url,
      userName: user_name || author.name,
      hasJiraReference: parsedInfo.hasJiraReference
    });
    
    // Send the message to WhatsApp
    await sendWhatsAppMessage(whatsAppMessage);
    
    if (parsedInfo.hasJiraReference) {
      console.log(`Sent notification for commit ${id.substring(0, 8)} with Jira reference ${parsedInfo.jiraCard}`);
    } else {
      console.log(`Sent notification for commit ${id.substring(0, 8)}`);
    }
  }
};

/**
 * Handles pipeline events
 */
const handlePipelineEvent = async (payload) => {
  const { 
    pipeline, 
    project,
    user,
    commit,
    object_attributes 
  } = payload;
  
  if (!object_attributes) {
    console.log('No pipeline attributes found');
    return;
  }
  
  // Only notify on important pipeline status changes
  const notifiableStatuses = ['success', 'failed', 'canceled','running'];
  
  if (!notifiableStatuses.includes(object_attributes.status)) {
    console.log(`Ignoring pipeline status: ${object_attributes.status}`);
    return;
  }
  
  // If there's a commit message, check if it has a Jira reference
  let hasJiraReference = false;
  let jiraCard = null;
  let commitType = null;
  
  if (commit && commit.message) {
    const parsedInfo = parseCommitMessage(commit.message);
    hasJiraReference = parsedInfo.hasJiraReference;
    jiraCard = parsedInfo.jiraCard;
    commitType = parsedInfo.type;
  }
  
  // Send notification for all pipelines
  const pipelineData = {
    id: object_attributes.id,
    status: object_attributes.status,
    project: project,
    user: user,
    ref: object_attributes.ref,
    sha: object_attributes.sha,
    jiraCard,
    commitType,
    url: `${project.web_url}/pipelines/${object_attributes.id}`,
    duration: object_attributes.duration,
    hasJiraReference
  };
  
  const whatsAppMessage = formatPipelineMessage(pipelineData);
  
  // Send the message to WhatsApp
  await sendWhatsAppMessage(whatsAppMessage);
  
  if (hasJiraReference) {
    console.log(`Sent notification for pipeline ${object_attributes.id} with status ${object_attributes.status} and Jira reference ${jiraCard}`);
  } else {
    console.log(`Sent notification for pipeline ${object_attributes.id} with status ${object_attributes.status}`);
  }
};

/**
 * Handles merge request events
 */
const handleMergeRequestEvent = async (payload) => {
  const { 
    user,
    project,
    object_attributes,
    labels,
    changes
  } = payload;
  
  if (!object_attributes) {
    console.log('No merge request attributes found');
    return;
  }
  
  // Only notify on important merge request state changes
  const notifiableActions = ['open', 'merge', 'close', 'reopen', 'approved', 'unapproved'];
  
  if (!notifiableActions.includes(object_attributes.action)) {
    console.log(`Ignoring merge request action: ${object_attributes.action}`);
    return;
  }
  
  // Check if the merge request title or description contains a Jira reference
  let hasJiraReference = false;
  let jiraCard = null;
  let commitType = null;
  
  // Check title for Jira reference
  const titleParsed = parseCommitMessage(object_attributes.title);
  if (titleParsed.hasJiraReference) {
    hasJiraReference = true;
    jiraCard = titleParsed.jiraCard;
    commitType = titleParsed.type;
  } else {
    // If not in title, try to find in description
    const descriptionMatch = object_attributes.description?.match(/([A-Z]+-\d+)/);
    if (descriptionMatch) {
      hasJiraReference = true;
      jiraCard = descriptionMatch[1];
    }
  }
  
  // Send notification for all merge requests
  const mrData = {
    id: object_attributes.iid,
    title: object_attributes.title,
    description: object_attributes.description,
    state: object_attributes.state,
    action: object_attributes.action,
    url: object_attributes.url,
    source: object_attributes.source_branch,
    target: object_attributes.target_branch,
    project: project,
    user: user,
    createdAt: object_attributes.created_at,
    updatedAt: object_attributes.updated_at,
    jiraCard,
    commitType,
    labels: labels || [],
    hasJiraReference
  };
  
  const whatsAppMessage = formatMergeRequestMessage(mrData);
  
  // Send the message to WhatsApp
  await sendWhatsAppMessage(whatsAppMessage);
  
  if (hasJiraReference) {
    console.log(`Sent notification for merge request !${object_attributes.iid} with action ${object_attributes.action} and Jira reference ${jiraCard}`);
  } else {
    console.log(`Sent notification for merge request !${object_attributes.iid} with action ${object_attributes.action}`);
  }
};

module.exports = router;
