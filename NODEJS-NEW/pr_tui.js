// pr_tui.js - Node.js TUI for PR insights using blessed


const blessed = require('blessed');
let fetch;
try {
  fetch = require('node-fetch');
  if (fetch.default) fetch = fetch.default;
} catch (e) {
  if (typeof global.fetch === 'function') {
    fetch = global.fetch;
  } else {
    console.error('node-fetch is not installed and fetch is not available. Run: npm install node-fetch');
    process.exit(1);
  }
}

function getToken() {
  return process.env.GH_TOKEN || '';
}

function getArgs() {
  const args = process.argv.slice(2);
  let owner = args[0] || process.env.GH_OWNER;
  let repo = args[1] || process.env.GH_REPO;
  let token = args[2] || getToken();
  if (!owner || !repo) {
    console.error('Usage: node pr_tui.js <owner> <repo> [token]');
    process.exit(1);
  }
  return { owner, repo, token };
}

async function fetchPRs(owner, repo, token) {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=50`;
  const res = await fetch(url, {
    headers: { 'Authorization': `token ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch PRs');
  return await res.json();
}

async function fetchPRDetails(owner, repo, pr_number, token) {
  const pr_url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}`;
  const comments_url = `https://api.github.com/repos/${owner}/${repo}/issues/${pr_number}/comments`;
  const review_comments_url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/comments`;
  const [prRes, commentsRes, reviewCommentsRes] = await Promise.all([
    fetch(pr_url, { headers: { 'Authorization': `token ${token}` } }),
    fetch(comments_url, { headers: { 'Authorization': `token ${token}` } }),
    fetch(review_comments_url, { headers: { 'Authorization': `token ${token}` } })
  ]);
  if (!prRes.ok) throw new Error('Failed to fetch PR details');
  const pr = await prRes.json();
  const comments = commentsRes.ok ? await commentsRes.json() : [];
  const review_comments = reviewCommentsRes.ok ? await reviewCommentsRes.json() : [];
  return { ...pr, comments, review_comments };
}

function prDetails(pr) {
  let lines = [];
  lines.push(`PR #${pr.number}: ${pr.title}`);
  lines.push(`Author: ${pr.user.login}  State: ${pr.state}`);
  lines.push(`Created at: ${pr.created_at}`);
  lines.push(`URL: ${pr.html_url}`);
  lines.push('');
  lines.push('Description:');
  (pr.body || '').split('\n').forEach(line => lines.push('  ' + line));
  lines.push('');
  lines.push(`Issue Comments (${pr.comments.length}):`);
  pr.comments.forEach(c => {
    lines.push(`  [${c.user.login}] ${c.created_at}`);
    (c.body || '').split('\n').forEach(l => lines.push('    ' + l));
    lines.push('');
  });
  lines.push(`Review Comments (${pr.review_comments.length}):`);
  pr.review_comments.forEach(c => {
    lines.push(`  [${c.user.login}] ${c.created_at} (File: ${c.path || ''})`);
    (c.body || '').split('\n').forEach(l => lines.push('    ' + l));
    lines.push('');
  });
  return lines;
}

function prDetails(pr) {
  let lines = [];
  lines.push(`PR #${pr.number}: ${pr.title}`);
  lines.push(`Author: ${pr.user.login}  State: ${pr.state}`);
  lines.push(`Created at: 2025-08-01`);
  lines.push('');
  lines.push('Description:');
  pr.body.split('\n').forEach(line => lines.push('  ' + line));
  lines.push('');
  lines.push(`Issue Comments (${pr.comments.length}):`);
  pr.comments.forEach(c => {
    lines.push(`  [${c.user.login}] ${c.created_at}`);
    c.body.split('\n').forEach(l => lines.push('    ' + l));
    lines.push('');
  });
  lines.push(`Review Comments (${pr.review_comments.length}):`);
  pr.review_comments.forEach(c => {
    lines.push(`  [${c.user.login}] ${c.created_at} (File: ${c.path || ''})`);
    c.body.split('\n').forEach(l => lines.push('    ' + l));
    lines.push('');
  });
  return lines;
}


async function main() {
  const { owner, repo, token } = getArgs();
  const screen = blessed.screen({ smartCSR: true, title: 'PR Insights TUI' });

  const loading = blessed.box({
    parent: screen,
    top: 'center', left: 'center', width: '50%', height: 5,
    content: 'Loading PRs...',
    border: 'line',
    style: { border: { fg: 'yellow' }, label: { fg: 'magenta' } }
  });
  screen.render();

  let prs = [];
  try {
    prs = await fetchPRs(owner, repo, token);
  } catch (e) {
    loading.setContent('Error fetching PRs: ' + e.message);
    screen.render();
    setTimeout(() => process.exit(1), 2000);
    return;
  }
  loading.hide();

  const list = blessed.list({
    parent: screen,
    label: ` Pull Requests for ${owner}/${repo} `,
    width: '50%',
    height: '100%',
    top: 0,
    left: 0,
    keys: true,
    vi: true,
    mouse: true,
    border: 'line',
    style: {
      selected: { bg: 'blue', fg: 'white' },
      item: { fg: 'white' },
      border: { fg: 'cyan' },
      label: { fg: 'magenta' }
    },
    items: prs.map(pr => `#${pr.number} ${pr.title} by ${pr.user.login}`)
  });

  const details = blessed.box({
    parent: screen,
    label: ' PR Details ',
    width: '50%',
    height: '100%',
    top: 0,
    left: '50%',
    border: 'line',
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    mouse: true,
    style: {
      border: { fg: 'cyan' },
      label: { fg: 'magenta' }
    },
    content: 'Select a PR to view details.'
  });

  list.focus();

  list.on('select', async (item, idx) => {
    details.setContent('Loading details...');
    screen.render();
    try {
      const pr = await fetchPRDetails(owner, repo, prs[idx].number, token);
      details.setContent(prDetails(pr).join('\n'));
    } catch (e) {
      details.setContent('Error loading PR details: ' + e.message);
    }
    screen.render();
    details.focus();
  });

  screen.key(['q', 'C-c'], () => process.exit(0));
  screen.key(['tab'], () => {
    if (screen.focused === list) {
      details.focus();
    } else {
      list.focus();
    }
  });

  details.key(['escape'], () => {
    list.focus();
  });

  screen.render();
}

main();
