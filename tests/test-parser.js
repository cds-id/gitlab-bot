/**
 * Message Parser Test Script
 * 
 * This script tests the commit message parser component
 */

// Import the message parser
const { parseCommitMessage } = require('../utils/messageParser');

// Test cases for the commit message parser
const testCases = [
  {
    description: 'Standard format with feat type',
    message: 'feat(JIRA-123) Add new feature',
    expected: {
      type: 'feat',
      jiraCard: 'JIRA-123',
      hasJiraReference: true,
      cleanMessage: 'Add new feature'
    }
  },
  {
    description: 'Standard format with fix type',
    message: 'fix(ABC-456) Fix critical bug',
    expected: {
      type: 'fix',
      jiraCard: 'ABC-456',
      hasJiraReference: true,
      cleanMessage: 'Fix critical bug'
    }
  },
  {
    description: 'Different type of commit',
    message: 'docs(TKT-789) Update documentation',
    expected: {
      type: 'docs',
      jiraCard: 'TKT-789',
      hasJiraReference: true,
      cleanMessage: 'Update documentation'
    }
  },
  {
    description: 'No Jira reference',
    message: 'Add new feature without Jira reference',
    expected: {
      type: null,
      jiraCard: null,
      hasJiraReference: false,
      cleanMessage: 'Add new feature without Jira reference'
    }
  },
  {
    description: 'Incorrect format (wrong brackets)',
    message: 'feat[JIRA-123] Wrong bracket format',
    expected: {
      type: null,
      jiraCard: null,
      hasJiraReference: false,
      cleanMessage: 'feat[JIRA-123] Wrong bracket format'
    }
  },
  {
    description: 'Incorrect format (missing space)',
    message: 'feat(JIRA-123)No space after Jira card',
    expected: {
      type: null,
      jiraCard: null,
      hasJiraReference: false,
      cleanMessage: 'feat(JIRA-123)No space after Jira card'
    }
  },
  {
    description: 'Multi-line commit message',
    message: 'feat(JIRA-123) Add new feature\n\nThis is a detailed description of the feature',
    expected: {
      type: 'feat',
      jiraCard: 'JIRA-123',
      hasJiraReference: true,
      cleanMessage: 'Add new feature\n\nThis is a detailed description of the feature'
    }
  }
];

/**
 * Run the message parser tests
 */
const runParserTests = () => {
  console.log('=== COMMIT MESSAGE PARSER TEST ===\n');
  
  let passedTests = 0;
  
  // Run each test case
  testCases.forEach((testCase, index) => {
    console.log(`Test #${index + 1}: ${testCase.description}`);
    console.log(`Message: "${testCase.message}"`);
    
    // Parse the message
    const result = parseCommitMessage(testCase.message);
    
    // Check if the result matches the expected outcome
    const passed = 
      result.type === testCase.expected.type &&
      result.jiraCard === testCase.expected.jiraCard &&
      result.hasJiraReference === testCase.expected.hasJiraReference &&
      result.cleanMessage === testCase.expected.cleanMessage;
    
    if (passed) {
      console.log('✅ PASSED');
      passedTests++;
    } else {
      console.log('❌ FAILED');
      console.log('Expected:');
      console.log(JSON.stringify(testCase.expected, null, 2));
      console.log('Actual:');
      console.log(JSON.stringify(result, null, 2));
    }
    
    console.log('-'.repeat(50));
  });
  
  // Summary
  console.log(`\nTest Summary: ${passedTests}/${testCases.length} tests passed`);
  
  if (passedTests === testCases.length) {
    console.log('🎉 All tests passed! The message parser is working correctly.');
  } else {
    console.log('❗ Some tests failed. Please review the parser implementation.');
  }
};

// Run the tests
runParserTests();
