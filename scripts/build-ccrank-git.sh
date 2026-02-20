#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR/cli/ccrank-git"

mkdir -p dist
GOOS=darwin GOARCH=arm64 go build -ldflags "-s -w" -o dist/ccrank-git_darwin_arm64 .
GOOS=linux GOARCH=amd64 go build -ldflags "-s -w" -o dist/ccrank-git_linux_amd64 .
GOOS=windows GOARCH=amd64 go build -ldflags "-s -w" -o dist/ccrank-git_windows_amd64.exe .

echo "Built binaries in cli/ccrank-git/dist"
