#!/usr/bin/env bash
# Trigger the "Deploy documentation" GitHub Actions workflow and wait for it.
set -euo pipefail

git_root="$(git rev-parse --show-toplevel)"
cd "$git_root"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit and push documentation changes first." >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "master" ]]; then
  echo "Documentation deploy runs from master (the GitHub Pages environment allows master)." >&2
  echo "Current branch: $branch" >&2
  exit 1
fi

if ! git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  echo "No upstream branch. Push master first." >&2
  exit 1
fi

local_sha="$(git rev-parse HEAD)"
remote_sha="$(git rev-parse '@{u}')"
if [[ "$local_sha" != "$remote_sha" ]]; then
  echo "Local HEAD does not match upstream. Push master first." >&2
  echo "  local:    $local_sha" >&2
  echo "  upstream: $remote_sha" >&2
  exit 1
fi

echo "Triggering Deploy documentation workflow on $branch ($local_sha)..."
gh workflow run deploy-docs.yml --ref "$branch"

run_id=""
for _ in $(seq 1 30); do
  run_id="$(
    gh run list --workflow=deploy-docs.yml --branch "$branch" --limit 10 \
      --json databaseId,headSha,createdAt \
      --jq "[.[] | select(.headSha==\"${local_sha}\")] | sort_by(.createdAt) | reverse | .[0].databaseId // empty"
  )"
  if [[ -n "$run_id" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$run_id" ]]; then
  echo "Timed out waiting for the workflow run. Check the Actions tab." >&2
  exit 1
fi

gh run watch "$run_id" --exit-status
echo "Documentation deployed: https://wsj-br.github.io/duplistatus/"
