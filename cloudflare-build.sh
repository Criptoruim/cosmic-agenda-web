#!/bin/bash
# Completely disable Bun
echo "Disabling Bun..."
export BUN_INSTALL=disabled
export PATH=$(dirname $(which npm)):$PATH
echo "PATH set to: $PATH"
echo "Using npm version: $(npm --version)"

# Force using npm and avoid Bun
echo "Forcing npm installation..."
echo "Installing dependencies with npm..."
npm install --no-frozen-lockfile
echo "Building with npm..."
npm run build
