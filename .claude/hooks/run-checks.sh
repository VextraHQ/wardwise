#!/usr/bin/env bash
# When Claude finishes a turn with uncommitted changes:
#   1. run format:check, lint, typecheck and test
#   2. report unused code from knip (never removes it)
#   3. remind Claude once to update the matching spec in docs/
# Exit 2 sends the message back to Claude, which then continues the turn.
input=$(cat)
cd "$CLAUDE_PROJECT_DIR" || exit 0

# Nothing changed (e.g. Claude only answered a question): skip.
[ -z "$(git status --porcelain)" ] && exit 0

# Already sent back once this turn: don't loop forever.
[ "$(echo "$input" | jq -r '.stop_hook_active // false')" = "true" ] && exit 0

# Remembers what this session has already been told.
session=$(echo "$input" | jq -r '.session_id // "unknown"')
memo="${TMPDIR:-/tmp}/claude-hooks-$session"
mkdir -p "$memo"

send_back() {
  echo "$1" >&2
  exit 2
}

# 1. Project checks, stopping at the first failure.
for check in format:check lint typecheck test; do
  if ! out=$(pnpm "$check" 2>&1); then
    send_back "pnpm $check failed:
$(echo "$out" | tail -n 40)"
  fi
done

# 2. Unused code. Report new findings once; the user decides what happens.
if ! knip_out=$(pnpm --silent knip 2>&1); then
  knip_hash=$(echo "$knip_out" | shasum | cut -c1-12)

  if [ ! -f "$memo/knip-$knip_hash" ]; then
    touch "$memo/knip-$knip_hash"
    send_back "knip reports unused code. Do NOT remove or change anything.
List these for the user and ask, per item, whether to remove it or keep it
(keep = add it to knip.json):
$knip_out"
  fi
fi

# 3. Code changed but no spec did: remind once per session.
code_changed=$(git status --porcelain | grep -vE ' docs/| \.claude/')
docs_changed=$(git status --porcelain docs/)

if [ -n "$code_changed" ] && [ -z "$docs_changed" ] && [ ! -f "$memo/docs-reminded" ]; then
  touch "$memo/docs-reminded"
  send_back "Code changed but nothing in docs/ did. If this changes product
behaviour or a user flow, update the matching spec doc (see CLAUDE.md >
Specs & Docs). If not, say so and skip it."
fi

exit 0
