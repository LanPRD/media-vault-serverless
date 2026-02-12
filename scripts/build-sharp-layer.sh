#!/bin/bash

# Build Sharp Lambda Layer
# This script uses Docker to compile Sharp with Linux binaries
# Uses tar to avoid symlink issues on Windows

set -e

LAYER_DIR="layers/sharp"
NODEJS_DIR="$LAYER_DIR/nodejs"
CONTAINER_NAME="sharp-layer-builder"

echo "Cleaning previous layer build..."
rm -rf "$LAYER_DIR"
mkdir -p "$NODEJS_DIR"

echo "Building Sharp layer using Docker..."
docker run --name "$CONTAINER_NAME" \
  --platform linux/amd64 \
  node:20-slim \
  bash -c "
    cd /tmp && \
    npm cache clean --force && \
    npm init -y && \
    npm install sharp --save && \
    rm -rf node_modules/.bin && \
    tar -cf /tmp/layer.tar node_modules package.json
  "

echo "Copying tar from container..."
docker cp "$CONTAINER_NAME:/tmp/layer.tar" "$NODEJS_DIR/layer.tar"

echo "Extracting tar..."
(cd "$NODEJS_DIR" && tar -xf layer.tar && rm layer.tar)

echo "Removing container..."
docker rm "$CONTAINER_NAME"

echo "Layer built successfully at $LAYER_DIR"
echo "Layer size: $(du -sh "$LAYER_DIR" 2>/dev/null | cut -f1 || echo 'unknown')"
