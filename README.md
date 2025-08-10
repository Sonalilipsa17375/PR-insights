
---

# 📦 GitHub Pull Request Insights

A Node.js tool for **monitoring and reviewing GitHub Pull Requests**:

1. **CLI mode** (`pr_monitor.js`) — Quick terminal output for PR lists or detailed PR information.
2. **TUI mode** (`pr_tui.js`) — Interactive split-pane terminal interface using `blessed` for browsing PRs and their details.

---

## ✨ Features

### **CLI (`pr_monitor.js`)**

* List PRs for a repository (`open`, `closed`, or `all`).
* View details of a single PR, including:

  * Title, author, state, creation date
  * Description/body text
  * Issue comments (general discussion)
  * Review comments (file-specific)

### **TUI (`pr_tui.js`)**

* Interactive list of PRs in the left pane.
* Scrollable PR details in the right pane.
* Keyboard navigation:

  * `Tab` → Switch focus between panes
  * `q` / `Ctrl+C` → Quit
  * `Esc` → Back to list from details view

---

## 🛠 Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/github-pr-insights.git
cd github-pr-insights
```

2. **Install dependencies**

```bash
npm install node-fetch blessed
```

---

## 🔑 Authentication

You need a **GitHub Personal Access Token** (PAT) to use the GitHub API.
Create one at [https://github.com/settings/tokens](https://github.com/settings/tokens) with the `repo` scope.

Set it in your environment:

```bash
export GH_TOKEN=your_token_here
```

Or pass it directly as a CLI argument (TUI mode).

---

## 🚀 Usage

### **CLI Mode**

```bash
# List open PRs
node pr_monitor.js <owner> <repo>

# List closed PRs
node pr_monitor.js <owner> <repo> --state closed

# Show details for PR #42
node pr_monitor.js <owner> <repo> --pr 42
```

**Example:**

```bash
node pr_monitor.js octocat Hello-World --state all
```

---

### **TUI Mode**

```bash
node pr_tui.js <owner> <repo> [token]
```

**Example:**

```bash
node pr_tui.js octocat Hello-World
```

---

## 📂 Project Structure

```
.
├── pr_monitor.js   # CLI script for PR listing/details
├── pr_tui.js       # Interactive TUI script
└── README.md       # Project documentation
```

---

## 📜 Functionality Overview

### **pr\_monitor.js**

* `getHeaders()` → Builds API request headers with token.
* `fetchPullRequests()` → Retrieves list of PRs.
* `fetchPullRequest()` → Retrieves details of a specific PR.
* `fetchIssueComments()` → Retrieves general discussion comments.
* `fetchReviewComments()` → Retrieves file-specific review comments.
* `printPRList()` → Displays a short list of PRs.
* `printPRDetails()` → Displays detailed PR info with comments.

### **pr\_tui.js**

* `getToken()` → Reads token from env or CLI arg.
* `getArgs()` → Parses CLI arguments for owner/repo/token.
* `fetchPRs()` → Retrieves PR list.
* `fetchPRDetails()` → Retrieves PR details + comments in parallel.
* `prDetails()` → Formats PR data into readable text lines for UI.
* `main()` → Builds TUI layout and handles user interaction.

---

## ⚡ Keyboard Shortcuts (TUI)

| Key            | Action                                   |
| -------------- | ---------------------------------------- |
| `Tab`          | Switch focus between PR list and details |
| `q` / `Ctrl+C` | Quit application                         |
| `Esc`          | Return to PR list from details view      |

---

## 📌 Notes

* Avoid hardcoding tokens — use environment variables for security.
* The GitHub API is paginated — currently, only up to 100 PRs (CLI) / 50 PRs (TUI) are fetched at once.
* For private repos, your token must have appropriate permissions.

---

## 📜 License

This project is licensed under the MIT License.

---
