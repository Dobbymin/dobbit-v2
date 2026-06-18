#!/usr/bin/env bash
set -euo pipefail

# Validate dobby-company issue-first GitHub workflow conventions for Dobbit v2.
#
# Checks:
#   1. Current branch, or BRANCH_NAME env, follows:
#      {type}/{issue_number}-{summary-slug}
#   2. Optional PR body file contains a closing keyword for the same issue.
#
# Usage:
#   .claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh
#   .claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh --pr-body pr-body.md
#   BRANCH_NAME='feat/12-news-cron-job' .claude/skills/issue-first-github-workflow/scripts/validate-github-workflow.sh

allowed_types='feat|fix|chore|refactor|docs|test|ci|perf'
branch_regex="^(${allowed_types})/([1-9][0-9]*)-[a-z0-9]+(-[a-z0-9]+)*$"
pr_body_file=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr-body)
      if [[ $# -lt 2 ]]; then
        echo "ERROR: --pr-body requires a file path" >&2
        exit 2
      fi
      pr_body_file="$2"
      shift 2
      ;;
    -h|--help)
      sed -n '1,28p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

branch="${BRANCH_NAME:-}"
if [[ -z "$branch" ]]; then
  branch="$(git branch --show-current 2>/dev/null || true)"
fi

if [[ -z "$branch" ]]; then
  echo "ERROR: could not determine branch name. Set BRANCH_NAME or run inside a git repo." >&2
  exit 1
fi

case "$branch" in
  main|master|develop|dev)
    echo "ERROR: workflow branch must not be a protected/base branch: $branch" >&2
    exit 1
    ;;
esac

if [[ ! "$branch" =~ $branch_regex ]]; then
  cat >&2 <<EOF
ERROR: invalid branch name: $branch
Expected format: {type}/{issue_number}-{summary-slug}
Allowed types: ${allowed_types//|/, }
Examples:
  feat/12-news-cron-job
  fix/16-auth-token-refresh
  chore/24-add-issue-pr-template
EOF
  exit 1
fi

issue_number="${BASH_REMATCH[2]}"
echo "OK: branch name is valid ($branch, issue #$issue_number)"

if [[ -n "$pr_body_file" ]]; then
  if [[ ! -f "$pr_body_file" ]]; then
    echo "ERROR: PR body file does not exist: $pr_body_file" >&2
    exit 1
  fi

  closing_keyword_regex='\b(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)[[:space:]]+#'
  if grep -Eiq "${closing_keyword_regex}${issue_number}\b" "$pr_body_file"; then
    echo "OK: PR body links issue #$issue_number"
  else
    cat >&2 <<EOF
ERROR: PR body does not close the branch issue #$issue_number
Add a GitHub closing keyword to the PR body, for example:
  Closes #$issue_number
  Fixes #$issue_number
  Resolves #$issue_number
EOF
    exit 1
  fi
fi
