/**
 * Message formatter for WhatsApp notifications
 * Contains formatting functions for different types of GitLab events
 */

/**
 * Format a commit message for WhatsApp
 * 
 * @param {Object} data - Commit data
 * @returns {string} - Formatted WhatsApp message
 */
const formatCommitMessage = (data) => {
  const {
    id,
    author,
    project,
    type,
    jiraCard,
    message,
    url,
    userName,
    hasJiraReference
  } = data;

  // Get emoji based on commit type
  const emoji = getTypeEmoji(type);
  
  // Format project name
  const projectName = project?.name || 'Unknown Project';
  
  // Format commit ID (shorter for readability)
  const shortId = id?.substring(0, 8) || 'Unknown';
  
  // Format the title based on whether there's a Jira reference
  const title = hasJiraReference 
    ? `*${emoji} New Commit: ${jiraCard}*` 
    : `*${emoji} New Commit*`;
  
  // Format the message
  let formattedMessage = `
${title}

*Project:* ${projectName}
*Commit:* \`${shortId}\`
*Author:* ${author?.name || userName || 'Unknown'} ${author?.email ? `<${author.email}>` : ''}`;

  // Add type and Jira info if available
  if (type) {
    formattedMessage += `\n*Type:* ${type} ${emoji}`;
  }
  
  if (hasJiraReference) {
    formattedMessage += `\n*Jira:* ${formatJiraLink(jiraCard)}`;
  }
  
  // Add branch if available
  if (data.branch) {
    formattedMessage += `\n*Branch:* \`${data.branch}\``;
  }
  
  // Add commit message
  formattedMessage += `

*Message:* 
${message}

${url ? `*URL:* ${url}` : ''}
`;

  return formattedMessage;
};

/**
 * Format a pipeline message for WhatsApp
 * 
 * @param {Object} data - Pipeline data
 * @returns {string} - Formatted WhatsApp message
 */
const formatPipelineMessage = (data) => {
  const {
    id,
    status,
    project,
    user,
    ref,
    sha,
    jiraCard,
    commitType,
    url,
    duration,
    hasJiraReference
  } = data;

  // Get emoji based on pipeline status
  const statusEmoji = getPipelineStatusEmoji(status);
  const typeEmoji = jiraCard ? getTypeEmoji(commitType) : '';
  
  // Format duration if available
  const formattedDuration = duration ? formatDuration(duration) : 'N/A';
  
  // Branch name from ref (refs/heads/main -> main)
  const branch = ref?.replace('refs/heads/', '') || 'Unknown';
  
  // Format the message
  let message = `
*${statusEmoji} Pipeline ${status.toUpperCase()}*

*Project:* ${project?.name || 'Unknown'}
*ID:* #${id || 'Unknown'}
*Branch:* \`${branch}\`
*Triggered by:* ${user?.name || 'Unknown'}
*Duration:* ${formattedDuration}
`;

  // Add Jira information if available
  if (hasJiraReference && jiraCard) {
    message += `
*Jira:* ${formatJiraLink(jiraCard)}
${commitType ? `*Type:* ${commitType} ${typeEmoji}` : ''}
`;
  }

  // Add commit SHA and URL
  message += `
*Commit:* \`${sha?.substring(0, 8) || 'Unknown'}\`
*URL:* ${url || 'N/A'}
`;

  return message;
};

/**
 * Format a merge request message for WhatsApp
 * 
 * @param {Object} data - Merge request data
 * @returns {string} - Formatted WhatsApp message
 */
const formatMergeRequestMessage = (data) => {
  const {
    id,
    title,
    state,
    action,
    url,
    source,
    target,
    project,
    user,
    jiraCard,
    commitType,
    labels,
    createdAt,
    updatedAt,
    hasJiraReference
  } = data;

  // Get emoji for the action
  const actionEmoji = getMergeRequestActionEmoji(action);
  const typeEmoji = jiraCard && commitType ? getTypeEmoji(commitType) : '';
  
  // Format the action for display
  const formattedAction = formatMrAction(action);
  
  // Format the message
  let message = `
*${actionEmoji} Merge Request ${formattedAction}*

*Project:* ${project?.name || 'Unknown'}
*MR:* !${id || 'Unknown'} ${state ? `(${state})` : ''}
*Title:* ${title || 'No title'}
*Author:* ${user?.name || 'Unknown'}
*Branches:* \`${source || 'Unknown'}\` → \`${target || 'Unknown'}\`
`;

  // Add Jira information if available
  if (hasJiraReference && jiraCard) {
    message += `
*Jira:* ${formatJiraLink(jiraCard)}
${commitType ? `*Type:* ${commitType} ${typeEmoji}` : ''}
`;
  }

  // Add labels if available
  if (labels && labels.length > 0) {
    const labelNames = labels.map(label => label.title || label).join(', ');
    message += `
*Labels:* ${labelNames}
`;
  }

  // Add URL
  message += `
*URL:* ${url || 'N/A'}
`;

  return message;
};

/**
 * Get emoji for merge request action
 * 
 * @param {string} action - Merge request action
 * @returns {string} - Emoji
 */
const getMergeRequestActionEmoji = (action) => {
  if (!action) return '❓';
  
  const actionEmojis = {
    open: '🟢',
    merge: '🔀',
    close: '🔴',
    reopen: '🔄',
    approved: '👍',
    unapproved: '👎',
    update: '📝'
  };
  
  return actionEmojis[action.toLowerCase()] || '❓';
};

/**
 * Format merge request action for display
 * 
 * @param {string} action - Merge request action
 * @returns {string} - Formatted action
 */
const formatMrAction = (action) => {
  if (!action) return 'Updated';
  
  const actionMap = {
    open: 'Opened',
    merge: 'Merged',
    close: 'Closed',
    reopen: 'Reopened',
    approved: 'Approved',
    unapproved: 'Approval Revoked',
    update: 'Updated'
  };
  
  return actionMap[action.toLowerCase()] || 'Updated';
};

/**
 * Get emoji for commit type
 * 
 * @param {string} type - Commit type
 * @returns {string} - Emoji
 */
const getTypeEmoji = (type) => {
  if (!type) return '📝';
  
  const typeEmojis = {
    feat: '✨',
    feature: '✨',
    fix: '🐛',
    docs: '📚',
    style: '💅',
    refactor: '♻️',
    perf: '⚡',
    test: '✅',
    build: '🛠️',
    ci: '⚙️',
    chore: '🧹'
  };
  
  return typeEmojis[type.toLowerCase()] || '📝';
};

/**
 * Get emoji for pipeline status
 * 
 * @param {string} status - Pipeline status
 * @returns {string} - Emoji
 */
const getPipelineStatusEmoji = (status) => {
  if (!status) return '❓';
  
  const statusEmojis = {
    success: '✅',
    failed: '❌',
    canceled: '⚠️',
    running: '🔄',
    pending: '⏳',
    skipped: '⏭️',
    created: '🆕',
    manual: '👨‍💻'
  };
  
  return statusEmojis[status.toLowerCase()] || '❓';
};

/**
 * Format duration in seconds to readable format
 * 
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'N/A';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format Jira card reference as a link
 * 
 * @param {string} jiraCard - Jira card ID
 * @returns {string} - Formatted Jira link
 */
const formatJiraLink = (jiraCard) => {
  if (!jiraCard) return 'N/A';
  
  // Extract project prefix
  const projectPrefix = jiraCard.split('-')[0];
  
  // Fallback to a generic JIRA URL if no environment variable is provided
  const jiraBaseUrl = process.env.JIRA_URL || 'https://jira.atlassian.com';
  
  return `${jiraCard} (${jiraBaseUrl}/browse/${jiraCard})`;
};

module.exports = {
  formatCommitMessage,
  formatPipelineMessage,
  formatMergeRequestMessage
};
