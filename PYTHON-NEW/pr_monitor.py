def fetch_pull_request_review_comments(owner, repo, pr_number, token=None):
    """
    Fetch review comments for a specific pull request.
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        pr_number (int): Pull request number
        token (str): GitHub personal access token (optional, recommended)
    Returns:
        list: List of review comment dicts
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/comments"
    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()
def fetch_pull_request_comments(owner, repo, pr_number, token=None):
    """
    Fetch comments for a specific pull request.
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        pr_number (int): Pull request number
        token (str): GitHub personal access token (optional, recommended)
    Returns:
        list: List of comment dicts
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments"
    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def print_pull_request_comments(comments):
    if not comments:
        print("No comments found on this pull request.")
        return
    for c in comments:
        print(f"[{c['user']['login']}] {c['created_at']}:\n{c['body']}\n---")
import requests
import os

def fetch_pull_requests(owner, repo, state='open', token=None):
    """
    Fetch pull requests from a GitHub repository.
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        state (str): PR state: 'open', 'closed', or 'all'
        token (str): GitHub personal access token (optional, recommended)
    Returns:
        list: List of pull request dicts
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    params = {'state': state, 'per_page': 100}
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()

def fetch_pull_request(owner, repo, pr_number, token=None):
    """
    Fetch a specific pull request by number from a GitHub repository.
    Args:
        owner (str): Repository owner
        repo (str): Repository name
        pr_number (int): Pull request number
        token (str): GitHub personal access token (optional, recommended)
    Returns:
        dict: Pull request details
    """
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

def print_pull_request(pr):
    if not pr:
        print("Pull request not found.")
        return
    print(f"PR #{pr['number']}: {pr['title']}")
    print(f"Author: {pr['user']['login']}")
    print(f"State: {pr['state']}")
    print(f"Created at: {pr['created_at']}")
    print(f"URL: {pr['html_url']}")
    print(f"Body: {pr['body']}")

def print_pull_requests(prs):
    if not prs:
        print("No pull requests found.")
        return
    for pr in prs:
        print(f"#{pr['number']} {pr['title']} by {pr['user']['login']} - {pr['state']} (URL: {pr['html_url']})")

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Monitor GitHub Pull Requests')
    parser.add_argument('owner', help='Repository owner')
    parser.add_argument('repo', help='Repository name')
    parser.add_argument('--state', default='open', choices=['open', 'closed', 'all'], help='PR state to monitor (ignored if --pr is used)')
    parser.add_argument('--pr', type=int, help='Specific pull request number to fetch')
    parser.add_argument('--comments', action='store_true', help='Show comments for the specified pull request (requires --pr)')
    parser.add_argument('--token', default=os.getenv('GH_TOKEN'), help='GitHub token (or set GITHUB_TOKEN env var)')
    args = parser.parse_args()
    try:
        if args.pr:
            pr = fetch_pull_request(args.owner, args.repo, args.pr, args.token)
            print_pull_request(pr)
            if args.comments:
                comments = fetch_pull_request_comments(args.owner, args.repo, args.pr, args.token)
                print_pull_request_comments(comments)
        else:
            prs = fetch_pull_requests(args.owner, args.repo, args.state, args.token)
            print_pull_requests(prs)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
