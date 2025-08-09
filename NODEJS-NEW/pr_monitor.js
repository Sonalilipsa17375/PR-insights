#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const readline = require('readline');
const process = require('process');
const { stdout, stdin } = process;

const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

function getHeaders() {
  const headers = { 'Accept': 'application/vnd.github+json' };
  if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return headers;
}

async function fetchPullRequests(owner, repo, state = 'open') {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=${state}&per_page=100`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch PRs: ${res.status}`);
  return res.json();
}

async function fetchPullRequest(owner, repo, prNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch PR: ${res.status}`);
  return res.json();
}

async function fetchIssueComments(owner, repo, prNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch issue comments: ${res.status}`);
  return res.json();
}

async function fetchReviewComments(owner, repo, prNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/comments`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch review comments: ${res.status}`);
  return res.json();
}

function printPRList(prs) {
  prs.forEach(pr => {
    console.log(`#${pr.number} ${pr.title} by ${pr.user.login} - ${pr.state} (URL: ${pr.html_url})`);
  });
}

function printPRDetails(pr, issueComments, reviewComments) {
  console.log(`\nPR #${pr.number}: ${pr.title}`);
  console.log(`Author: ${pr.user.login}  State: ${pr.state}`);
  console.log(`URL: ${pr.html_url}`);
  console.log(`Created at: ${pr.created_at}`);
  console.log(`\nDescription:\n${pr.body || ''}`);
  console.log(`\nIssue Comments (${issueComments.length}):`);
  issueComments.forEach(c => {
    console.log(`[${c.user.login}] ${c.created_at}:\n${c.body}\n---`);
  });
  console.log(`\nReview Comments (${reviewComments.length}):`);
  reviewComments.forEach(c => {
    console.log(`[${c.user.login}] ${c.created_at} (File: ${c.path}):\n${c.body}\n---`);
  });
}

async function main() {
  const [,, owner, repo, ...args] = process.argv;
  if (!owner || !repo) {
    console.log('Usage: node pr_monitor.js <owner> <repo> [--pr <number>] [--state <state>]');
    process.exit(1);
  }
  let prNumber = null;
  let state = 'open';
  for (let i = 0; i < args.length; ++i) {
    if (args[i] === '--pr' && args[i+1]) prNumber = args[++i];
    if (args[i] === '--state' && args[i+1]) state = args[++i];
  }
  try {
    if (prNumber) {
      const pr = await fetchPullRequest(owner, repo, prNumber);
      const issueComments = await fetchIssueComments(owner, repo, prNumber);
      const reviewComments = await fetchReviewComments(owner, repo, prNumber);
      printPRDetails(pr, issueComments, reviewComments);
    } else {
      const prs = await fetchPullRequests(owner, repo, state);
      printPRList(prs);
    }
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

if (require.main === module) main();
