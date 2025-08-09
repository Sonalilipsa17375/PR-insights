prinsights
=================
CLI tool to analyze GitHub pull requests with ease

`NOTICE: Current development has been shifted to PYTHON-NEW and NODEJS-New directories. Kindly use them for future and present purposes.`

# Installation and Program Files

| Backend | File                        |
|---------|-----------------------------|
| Nodejs  | `/NODEJS-NEW/pr_monitor.js` |
| Python  | `/PYTHON-NEW/pr_monitor.py` |
| oclif   | `/bin/dev.js`               |

# Usage Commands
```sh-session
$ prinsights check --owner=sonali --repo=Hello-World --pr=38
```

# Python Usage Example
```sh-session
$ python pr_monitor.py <Organisation> <Repo>
#5 Adding TUI support by user1
#2 Adding Best CLI by user2
#1 Initial commit by user1

$ python pr_monitor.py <Organisation> <Repo> --state closed
#4 Add odlif support by user2
#3 Update fetch functions by user2

$ python pr_monitor.py <Organisation> <Repo> --pr 1
PR #1: Initial commit
Author: user1
State: open
Created at: 2015-10-17T00:22:03Z
URL: https://github.com/<Organisation>/<Repo>/pull/1
Body: Add the changes for intial start commit.
```

# Contributor
Sonali Lipsa Patra (@Sonalilipsa17375)