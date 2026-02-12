#!/usr/bin/env bash

echo -e "🗑️   Removing dist folder..."
rm --recursive --force dist

echo -e "🗑️   Removing .esbuild folder..."
rm --recursive --force .esbuild

echo -e "🗑️   Removing layers folder...\n"
rm --recursive --force layers