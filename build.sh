#!/bin/bash
# Force using npm instead of Bun
echo "Installing dependencies with npm..."
npm install
echo "Building with npm..."
npm run build
