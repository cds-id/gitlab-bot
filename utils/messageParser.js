/**
 * Parses a commit message to extract type and Jira card reference
 * Looks for the conventional commit format: <type>(<jira_card>) <message>
 * 
 * @param {string} message - The commit message to parse
 * @returns {object} - Parsed information including type, jiraCard, hasJiraReference and cleanMessage
 */
const parseCommitMessage = (message) => {
  // Default response structure
  const result = {
    type: null,
    jiraCard: null,
    hasJiraReference: false,
    cleanMessage: message
  };

  // Regex to match the conventional commit format with Jira card reference
  // Example: feat(ABC-123) Add new feature
  const regex = /^(\w+)\(([A-Z]+-\d+)\)(?:\s+)(.+)$/;
  const match = message.match(regex);

  if (match) {
    result.type = match[1];         // e.g., 'feat', 'fix', 'docs'
    result.jiraCard = match[2];     // e.g., 'ABC-123'
    result.hasJiraReference = true;
    result.cleanMessage = match[3]; // The commit message without the type and jira reference
  }

  return result;
};

module.exports = {
  parseCommitMessage
};
