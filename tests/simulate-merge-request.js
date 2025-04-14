/**
 * GitLab Merge Request Event Simulator
 * 
 * This script simulates GitLab webhook merge request events to test the webhook service
 */

const axios = require('axios');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhook/gitlab';

// Sample test data
const testCases = [
  {
    name: 'New Merge Request with Jira Reference',
    action: 'open',
    title: 'feat(JIRA-123) Add new feature',
    description: 'This MR implements the feature described in JIRA-123',
    sourceBranch: 'feature/jira-123',
    targetBranch: 'main'
  },
  {
    name: 'Merged MR with Jira Reference',
    action: 'merge',
    title: 'fix(PROJ-456) Fix critical bug',
    description: 'This MR fixes the critical bug reported in PROJ-456',
    sourceBranch: 'bugfix/proj-456',
    targetBranch: 'main'
  },
  {
    name: 'Approved MR with Jira Reference',
    action: 'approved',
    title: 'docs(TKT-789) Update documentation',
    description: 'This MR updates the documentation as requested in TKT-789',
    sourceBranch: 'docs/tkt-789',
    targetBranch: 'develop'
  },
  {
    name: 'Closed MR without Jira Reference in title but in description',
    action: 'close',
    title: 'Update build configuration',
    description: 'This updates the build configuration as discussed in ABC-101',
    sourceBranch: 'feature/build-config',
    targetBranch: 'develop'
  },
  {
    name: 'MR without any Jira Reference',
    action: 'open',
    title: 'Update README',
    description: 'Minor updates to the README file',
    sourceBranch: 'docs/readme-update',
    targetBranch: 'main'
  }
];

// Function to generate a mock GitLab merge request webhook payload
const generateMockMergeRequestPayload = (testCase) => {
  const mrId = Math.floor(Math.random() * 1000);
  const userId = Math.floor(Math.random() * 10000);
  const projectId = Math.floor(Math.random() * 10000);
  const now = new Date();
  const createdAt = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  
  return {
    object_kind: 'merge_request',
    event_type: 'merge_request',
    user: {
      id: userId,
      name: 'Test User',
      username: 'testuser',
      avatar_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon',
      email: 'test.user@example.com'
    },
    project: {
      id: projectId,
      name: 'Test Project',
      description: 'Test project for merge request simulation',
      web_url: 'https://gitlab.example.com/test/project',
      avatar_url: null,
      git_ssh_url: 'git@gitlab.example.com:test/project.git',
      git_http_url: 'https://gitlab.example.com/test/project.git',
      namespace: 'Test',
      visibility_level: 0,
      path_with_namespace: 'test/project',
      default_branch: 'main'
    },
    object_attributes: {
      id: mrId + 10000,
      iid: mrId,
      target_branch: testCase.targetBranch,
      source_branch: testCase.sourceBranch,
      source_project_id: projectId,
      target_project_id: projectId,
      state: testCase.action === 'merge' ? 'merged' : 
             testCase.action === 'close' ? 'closed' : 'opened',
      title: testCase.title,
      description: testCase.description,
      created_at: createdAt.toISOString(),
      updated_at: now.toISOString(),
      merge_status: 'can_be_merged',
      action: testCase.action,
      url: `https://gitlab.example.com/test/project/-/merge_requests/${mrId}`,
      last_commit: {
        id: uuidv4().replace(/-/g, ''),
        message: testCase.title,
        timestamp: now.toISOString(),
        url: `https://gitlab.example.com/test/project/-/commit/${uuidv4().replace(/-/g, '')}`,
        author: {
          name: 'Test Author',
          email: 'author@example.com'
        }
      }
    },
    labels: [
      {
        id: 1,
        title: 'Feature',
        color: '#428BCA',
        project_id: projectId,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString()
      }
    ],
    changes: {
      state: {
        previous: testCase.action === 'open' ? null : 'opened',
        current: testCase.action === 'merge' ? 'merged' : 
                 testCase.action === 'close' ? 'closed' : 'opened'
      }
    }
  };
};

// Function to send a test webhook
const sendTestWebhook = async (testCase) => {
  const payload = generateMockMergeRequestPayload(testCase);
  
  console.log(`\n🚀 Running merge request test: "${testCase.name}"`);
  console.log(`Action: "${testCase.action}"`);
  console.log(`Title: "${testCase.title}"`);
  console.log(`Source Branch: "${testCase.sourceBranch}"`);
  console.log(`Target Branch: "${testCase.targetBranch}"`);
  
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Gitlab-Event': 'Merge Request Hook',
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
  console.log('=== GITLAB MERGE REQUEST WEBHOOK SIMULATOR ===');
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
