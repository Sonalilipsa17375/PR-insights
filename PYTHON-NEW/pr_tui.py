import os
import sys
import argparse
import requests
import curses
from pr_monitor import fetch_pull_requests, fetch_pull_request, fetch_pull_request_comments

def get_token():
    return os.getenv('GH_TOKEN')

def tui_main(stdscr, owner, repo, token):
    curses.curs_set(0)
    stdscr.clear()
    prs = fetch_pull_requests(owner, repo, state='open', token=token)
    selected = 0
    scroll = 0
    while True:
        stdscr.clear()
        max_y, max_x = stdscr.getmaxyx()
        header = f"Pull Requests for {owner}/{repo}"
        stdscr.addstr(0, 0, header[:max_x], curses.A_BOLD)
        visible_rows = max_y - 4  # header + footer + at least 2 lines
        if selected < scroll:
            scroll = selected
        elif selected >= scroll + visible_rows:
            scroll = selected - visible_rows + 1
        for idx in range(scroll, min(scroll + visible_rows, len(prs))):
            pr = prs[idx]
            line = f"#{pr['number']} {pr['title']} by {pr['user']['login']}"
            line = line[:max_x]
            screen_idx = idx - scroll + 2
            if idx == selected:
                stdscr.addstr(screen_idx, 0, line, curses.A_REVERSE)
            else:
                stdscr.addstr(screen_idx, 0, line)
        footer = "Up/Down: Navigate  Enter: Details  q: Quit"
        stdscr.addstr(max_y-1, 0, footer[:max_x], curses.A_DIM)
        key = stdscr.getch()
        if key == curses.KEY_UP and selected > 0:
            selected -= 1
        elif key == curses.KEY_DOWN and selected < len(prs)-1:
            selected += 1
        elif key in (ord('\n'), 10, 13):
            show_pr_details(stdscr, owner, repo, prs[selected]['number'], token)
        elif key in (ord('q'), ord('Q')):
            break

def show_pr_details(stdscr, owner, repo, pr_number, token):
    from pr_monitor import fetch_pull_request_review_comments
    pr = fetch_pull_request(owner, repo, pr_number, token)
    comments = fetch_pull_request_comments(owner, repo, pr_number, token)
    review_comments = fetch_pull_request_review_comments(owner, repo, pr_number, token)
    # Prepare all lines to display
    lines = []
    lines.append(f"PR #{pr['number']}: {pr['title']}")
    lines.append(f"Author: {pr['user']['login']}  State: {pr['state']}")
    lines.append(f"URL: {pr['html_url']}")
    lines.append(f"Created at: {pr['created_at']}")
    lines.append("")
    lines.append("Description:")
    desc_lines = pr['body'].split('\n') if pr['body'] else ['']
    for line in desc_lines:
        lines.append("  " + line)
    lines.append("")
    lines.append(f"Issue Comments ({len(comments)}):")
    for c in comments:
        lines.append(f"  [{c['user']['login']}] {c['created_at']}")
        for l in c['body'].split('\n'):
            lines.append("    " + l)
        lines.append("")
    lines.append(f"Review Comments ({len(review_comments)}):")
    for c in review_comments:
        lines.append(f"  [{c['user']['login']}] {c['created_at']} (File: {c.get('path', '')})")
        for l in c['body'].split('\n'):
            lines.append("    " + l)
        lines.append("")
    # Scrolling logic
    vscroll = 0
    hscroll = 0
    while True:
        stdscr.clear()
        max_y, max_x = stdscr.getmaxyx()
        visible_lines = max_y - 2
        for i in range(visible_lines):
            idx = vscroll + i
            if idx >= len(lines):
                break
            line = lines[idx]
            if hscroll < len(line):
                stdscr.addstr(i, 0, line[hscroll:hscroll+max_x])
            else:
                stdscr.addstr(i, 0, "")
        stdscr.addstr(max_y-1, 0, "Up/Down: Scroll  Left/Right: Pan  q/Esc: Back"[:max_x], curses.A_DIM)
        key = stdscr.getch()
        if key in (ord('q'), ord('Q'), 27):  # 27 = Esc
            break
        elif key == curses.KEY_UP and vscroll > 0:
            vscroll -= 1
        elif key == curses.KEY_DOWN and vscroll + visible_lines < len(lines):
            vscroll += 1
        elif key == curses.KEY_LEFT and hscroll > 0:
            hscroll -= 8 if hscroll >= 8 else 1
        elif key == curses.KEY_RIGHT:
            # Only scroll right if at least one visible line is longer than the window
            if any(len(lines[vscroll + i]) > hscroll + max_x for i in range(visible_lines) if vscroll + i < len(lines)):
                hscroll += 8

def main():
    parser = argparse.ArgumentParser(description='TUI for monitoring GitHub Pull Requests')
    parser.add_argument('owner', help='Repository owner')
    parser.add_argument('repo', help='Repository name')
    parser.add_argument('--token', default=get_token(), help='GitHub token (or set GH_TOKEN env var)')
    args = parser.parse_args()
    curses.wrapper(tui_main, args.owner, args.repo, args.token)

if __name__ == "__main__":
    main()
