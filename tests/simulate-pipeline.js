/**
 * GitLab Pipeline Event Simulator
 * 
 * This script simulates GitLab webhook pipeline events to test the webhook service
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
    name: 'Successful Pipeline with Jira Reference',
    status: 'success',
    commitMessage: 'feat(JIRA-123) Add new feature',
    branch: 'main',
    duration: 125
  },
  {
    name: 'Failed Pipeline with Jira Reference',
    status: 'failed',
    commitMessage: 'fix(PROJ-456) Fix critical bug',
    branch: 'develop',
    duration: 87
  },
  {
    name: 'Failed Pipeline without Jira Reference',
    status: 'failed',
    commitMessage: 'Update README file',
    branch: 'feature/readme-update',
    duration: 45
  },
  {
    name: 'Successful Pipeline without Jira Reference',
    status: 'success',
    commitMessage: 'Merge branch main into develop',
    branch: 'develop',
    duration: 153
  },
  {
    name: 'Canceled Pipeline with Jira Reference',
    status: 'canceled',
    commitMessage: 'docs(TKT-789) Update documentation',
    branch: 'feature/docs-update',
    duration: 32
  }
];

// Function to generate a mock GitLab pipeline webhook payload
const generateMockPipelinePayload = (testCase) => {
  const pipelineId = Math.floor(Math.random() * 1000000);
  const commitId = uuidv4().replace(/-/g, '');
  const userId = Math.floor(Math.random() * 10000);
  const projectId = Math.floor(Math.random() * 10000);
  
  return {
    object_kind: 'pipeline',
    object_attributes: {
      id: pipelineId,
      ref: `refs/heads/${testCase.branch}`,
      tag: false,
      sha: commitId,
      status: testCase.status,
      detailed_status: testCase.status,
      stages: ['build', 'test', 'deploy'],
      created_at: new Date(Date.now() - testCase.duration * 1000).toISOString(),
      finished_at: new Date().toISOString(),
      duration: testCase.duration,
      variables: []
    },
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
      description: 'Test project for pipeline simulation',
      web_url: 'https://gitlab.example.com/test/project',
      avatar_url: null,
      git_ssh_url: 'git@gitlab.example.com:test/project.git',
      git_http_url: 'https://gitlab.example.com/test/project.git',
      namespace: 'Test',
      visibility_level: 0,
      path_with_namespace: 'test/project',
      default_branch: 'main'
    },
    commit: {
      id: commitId,
      message: testCase.commitMessage,
      title: testCase.commitMessage.split('\n')[0],
      timestamp: new Date().toISOString(),
      url: `https://gitlab.example.com/test/project/-/commit/${commitId}`,
      author: {
        name: 'Test Author',
        email: 'author@example.com'
      }
    },
    builds: [
      {
        id: Math.floor(Math.random() * 1000000),
        stage: 'build',
        name: 'build-job',
        status: testCase.status,
        created_at: new Date(Date.now() - testCase.duration * 1000).toISOString(),
        finished_at: new Date().toISOString(),
        duration: testCase.duration,
        runner: null,
        artifacts_file: {
          filename: null,
          size: null
        }
      },
      {
        id: Math.floor(Math.random() * 1000000),
        stage: 'test',
        name: 'test-job',
        status: testCase.status,
        created_at: new Date(Date.now() - (testCase.duration * 0.8) * 1000).toISOString(),
        finished_at: new Date().toISOString(),
        duration: testCase.duration * 0.8,
        runner: null,
        artifacts_file: {
          filename: null,
          size: null
        }
      }
    ]
  };
};

// Function to send a test webhook
const sendTestWebhook = async (testCase) => {
  const payload = generateMockPipelinePayload(testCase);
  
  console.log(`\n🚀 Running pipeline test: "${testCase.name}"`);
  console.log(`Status: "${testCase.status}"`);
  console.log(`Commit message: "${testCase.commitMessage}"`);
  console.log(`Branch: "${testCase.branch}"`);
  
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Gitlab-Event': 'Pipeline Hook',
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
  console.log('=== GITLAB PIPELINE WEBHOOK SIMULATOR ===');
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
