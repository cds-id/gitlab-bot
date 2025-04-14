/**
 * GitLab Webhook Simulator
 * 
 * This script simulates GitLab webhook push events to test the webhook service
 */

const axios = require('axios');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config({ path: '../.env' });

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhook/gitlab';

// Sample test data
const testCases = [
  {
    name: 'Valid Jira Reference',
    message: 'feat(JIRA-123) Add new feature',
    shouldMatch: true
  },
  {
    name: 'Valid Jira Reference with Fix Type',
    message: 'fix(PROJ-456) Fix critical bug',
    shouldMatch: true
  },
  {
    name: 'Valid Jira Reference with Docs Type',
    message: 'docs(TKT-789) Update documentation',
    shouldMatch: true
  },
  {
    name: 'No Jira Reference',
    message: 'Update README file',
    shouldMatch: false
  },
  {
    name: 'Incorrect Format',
    message: 'feat[JIRA-123] Wrong bracket format',
    shouldMatch: false
  }
];

// Function to generate a mock GitLab webhook payload
const generateMockPayload = (commitMessage) => {
  const commitId = uuidv4().replace(/-/g, '');
  
  return {
    object_kind: 'push',
    event_name: 'push',
    before: '0000000000000000000000000000000000000000',
    after: commitId,
    ref: 'refs/heads/main',
    checkout_sha: commitId,
    user_id: 12345,
    user_name: 'Test User',
    user_username: 'testuser',
    user_email: 'testuser@example.com',
    project_id: 12345,
    project: {
      id: 12345,
      name: 'Test Project',
      description: 'Test project for webhook simulation',
      web_url: 'https://gitlab.example.com/test/project',
      git_ssh_url: 'git@gitlab.example.com:test/project.git',
      git_http_url: 'https://gitlab.example.com/test/project.git',
      namespace: 'Test',
      visibility_level: 0,
      path_with_namespace: 'test/project',
      default_branch: 'main'
    },
    commits: [
      {
        id: commitId,
        message: commitMessage,
        title: commitMessage.split('\n')[0],
        timestamp: new Date().toISOString(),
        url: `https://gitlab.example.com/test/project/-/commit/${commitId}`,
        author: {
          name: 'Test Author',
          email: 'author@example.com'
        }
      }
    ],
    total_commits_count: 1,
    repository: {
      name: 'Test Repository',
      url: 'git@gitlab.example.com:test/project.git',
      description: 'Test Repository',
      homepage: 'https://gitlab.example.com/test/project'
    }
  };
};

// Function to send a test webhook
const sendTestWebhook = async (testCase) => {
  const payload = generateMockPayload(testCase.message);
  
  console.log(`\n🚀 Running test: "${testCase.name}"`);
  console.log(`Commit message: "${testCase.message}"`);
  console.log(`Expected to match: ${testCase.shouldMatch}`);
  
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Gitlab-Event': 'Push Hook',
        'X-Gitlab-Token': 'test_token'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
};

// Function to run all tests
const runAllTests = async () => {
  console.log('=== GITLAB WEBHOOK SIMULATOR ===');
  console.log(`Target URL: ${WEBHOOK_URL}`);
  
  for (const testCase of testCases) {
    await sendTestWebhook(testCase);
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n=== TESTS COMPLETED ===');
};

// Run the tests
runAllTests();
