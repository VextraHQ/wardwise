#!/usr/bin/env bash
# After Claude edits a file: format it with Prettier, then fix lint in JS/TS files.
file=$(jq -r '.tool_input.file_path // .tool_response.filePath // empty')
[ -f "$file" ] || exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0
pnpm exec prettier --write --ignore-unknown "$file" >/dev/null

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.mjs | *.cjs)
    # Show remaining lint errors to Claude so it can fix them.
    if ! out=$(pnpm exec eslint --fix "$file" 2>&1); then
      echo "$out" >&2
      exit 2
    fi
    ;;
esac
exit 0
