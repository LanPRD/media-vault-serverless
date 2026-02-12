#!/usr/bin/env bash

set -euo pipefail

ENV="$1"

function show_help {
  echo "Usage: $0 [dev|prod]"
  echo "  dev: Build for development environment"
  echo "  prod: Build for production environment"
  exit 1
}

case "$ENV" in
  dev)
    BUILD_COMMAND="npx serverless deploy --stage dev"
    ;;
  prod)
    BUILD_COMMAND="npx serverless deploy --stage prod"
    ;;
  *)
    show_help
    ;;
esac

echo -e "📝   Checking types...\n"
npx tsc --noEmit

bash scripts/clear-root-files.sh

if ! docker info > /dev/null 2>&1; then
  echo -e "⚠️   Docker isn't running. Please start Docker and try again.\n"
  exit 1
fi

if ! (echo > /dev/tcp/127.0.0.1/4566) > /dev/null 2>&1; then
  echo -e "⚠️   Docker daemon isn't running at port 4566. Please start Docker and try again.\n"
  exit 1
fi

echo -e "🧪   Running tests...\n"
npx vitest --config vitest.config.ts --run

echo -e "Checking prettier...\n"

if ! npx prettier --check .; then
  echo "⚠️  Prettier failed. Formatting files..."
  npx prettier --write .
fi

echo -e "📝   Checking eslint...\n"
npm run lint

echo -e "📦   Building layer...\n"
bash scripts/build-sharp-layer.sh

echo -e "🚀   Deploying..."
$BUILD_COMMAND
