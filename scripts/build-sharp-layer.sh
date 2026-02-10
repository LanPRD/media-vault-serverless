#!/bin/bash

# Build Sharp Lambda Layer
# This script uses Docker to compile Sharp with Linux binaries

set -e

LAYER_DIR="layers/sharp"
NODEJS_DIR="$LAYER_DIR/nodejs"

echo "Cleaning previous layer build..."
rm -rf "$LAYER_DIR"
mkdir -p "$NODEJS_DIR"

echo "Building Sharp layer using Docker..."
docker run --rm \
  -v "$(pwd)/$NODEJS_DIR:/output" \
  --platform linux/amd64 \
  node:20-slim \
  bash -c "
    cd /tmp && \
    npm cache clean --force && \
    npm init -y && \
    npm install sharp --save && \
    cp -r node_modules /output/ && \
    cp package.json /output/
  "

echo "Layer built successfully at $LAYER_DIR"
echo "Layer size: $(du -sh $LAYER_DIR | cut -f1)"
