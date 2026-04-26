/**
 * Message formatter for Linear webhook notifications
 * https://linear.app/developers/webhooks
 */

const formatIssueMessage = (payload) => {
  const { action, data, url, updatedFrom } = payload;
  const actionEmoji = getIssueActionEmoji(action);
  const formattedAction = formatAction(action);

  const identifier = data?.identifier || 'Unknown';
  const title = data?.title || 'No title';
  const stateName = data?.state?.name || 'Unknown';
  const priorityLabel = data?.priorityLabel || 'No priority';
  const teamName = data?.team?.name || 'Unknown team';
  const assignee = data?.assignee?.name || 'Unassigned';
  const creator = data?.creator?.name || data?.user?.name || 'Unknown';
  const issueUrl = data?.url || url;

  let message = `
*${actionEmoji} Linear Issue ${formattedAction}*

*Issue:* ${identifier} - ${title}
*Team:* ${teamName}
*State:* ${stateName}
*Priority:* ${priorityLabel}
*Assignee:* ${assignee}
*Author:* ${creator}`;

  if (action === 'update' && updatedFrom) {
    const changes = describeUpdates(updatedFrom, data);
    if (changes) {
      message += `\n*Changes:* ${changes}`;
    }
  }

  if (data?.labels && data.labels.length > 0) {
    const labelNames = data.labels.map((l) => l.name || l).join(', ');
    message += `\n*Labels:* ${labelNames}`;
  }

  if (data?.description) {
    const description = truncate(data.description, 300);
    message += `\n\n*Description:*\n${description}`;
  }

  if (issueUrl) {
    message += `\n\n*URL:* ${issueUrl}`;
  }

  return message;
};

const formatCommentMessage = (payload) => {
  const { action, data, url } = payload;
  const actionEmoji = action === 'create' ? '💬' : action === 'update' ? '✏️' : '🗑️';
  const formattedAction = formatAction(action);

  const issueIdentifier = data?.issue?.identifier || 'Unknown';
  const issueTitle = data?.issue?.title || 'No title';
  const author = data?.user?.name || 'Unknown';
  const body = truncate(data?.body || '', 500);
  const commentUrl = data?.url || url;

  let message = `
*${actionEmoji} Linear Comment ${formattedAction}*

*Issue:* ${issueIdentifier} - ${issueTitle}
*Author:* ${author}

*Comment:*
${body}`;

  if (commentUrl) {
    message += `\n\n*URL:* ${commentUrl}`;
  }

  return message;
};

const formatProjectMessage = (payload) => {
  const { action, data, url } = payload;
  const actionEmoji = action === 'create' ? '📁' : action === 'update' ? '📝' : '🗑️';
  const formattedAction = formatAction(action);

  const name = data?.name || 'Unnamed project';
  const state = data?.state || 'unknown';
  const lead = data?.lead?.name || 'No lead';
  const projectUrl = data?.url || url;

  let message = `
*${actionEmoji} Linear Project ${formattedAction}*

*Project:* ${name}
*State:* ${state}
*Lead:* ${lead}`;

  if (data?.description) {
    message += `\n\n*Description:*\n${truncate(data.description, 300)}`;
  }

  if (projectUrl) {
    message += `\n\n*URL:* ${projectUrl}`;
  }

  return message;
};

const formatGenericMessage = (payload) => {
  const { action, type, data, url } = payload;
  const formattedAction = formatAction(action);

  let message = `
*🔔 Linear ${type} ${formattedAction}*`;

  if (data?.name || data?.title) {
    message += `\n*Name:* ${data.name || data.title}`;
  }

  if (url) {
    message += `\n*URL:* ${url}`;
  }

  return message;
};

const formatLinearEvent = (payload) => {
  const { type } = payload;

  switch (type) {
    case 'Issue':
      return formatIssueMessage(payload);
    case 'Comment':
      return formatCommentMessage(payload);
    case 'Project':
    case 'ProjectUpdate':
      return formatProjectMessage(payload);
    default:
      return formatGenericMessage(payload);
  }
};

const getIssueActionEmoji = (action) => {
  const emojis = {
    create: '🆕',
    update: '🔄',
    remove: '🗑️'
  };
  return emojis[action] || '🔔';
};

const formatAction = (action) => {
  if (!action) return 'Updated';
  const map = {
    create: 'Created',
    update: 'Updated',
    remove: 'Removed'
  };
  return map[action] || action.charAt(0).toUpperCase() + action.slice(1);
};

const describeUpdates = (updatedFrom, data) => {
  const changes = [];

  if (updatedFrom.stateId !== undefined && data?.state?.name) {
    changes.push(`state → ${data.state.name}`);
  }
  if (updatedFrom.assigneeId !== undefined) {
    changes.push(`assignee → ${data?.assignee?.name || 'Unassigned'}`);
  }
  if (updatedFrom.priority !== undefined && data?.priorityLabel) {
    changes.push(`priority → ${data.priorityLabel}`);
  }
  if (updatedFrom.title !== undefined) {
    changes.push(`title updated`);
  }
  if (updatedFrom.description !== undefined) {
    changes.push(`description updated`);
  }
  if (updatedFrom.estimate !== undefined && data?.estimate !== undefined) {
    changes.push(`estimate → ${data.estimate}`);
  }

  return changes.join(', ');
};

const truncate = (text, max) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.substring(0, max) + '…';
};

module.exports = {
  formatLinearEvent,
  formatIssueMessage,
  formatCommentMessage,
  formatProjectMessage
};
