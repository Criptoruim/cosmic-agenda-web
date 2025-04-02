#!/bin/bash
# Force using npm and avoid Bun
echo "Forcing npm installation..."
export PATH=$(dirname $(which npm)):$PATH
echo "PATH set to: $PATH"
echo "Using npm version: $(npm --version)"
echo "Installing dependencies with npm..."
npm install --no-frozen-lockfile
echo "Building with npm..."
npm run build
