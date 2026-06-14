#!/bin/bash

# Build Go functions for AWS Lambda / Netlify Functions

set -e

FUNCTIONS=("stripeSuccess")

for f in "${FUNCTIONS[@]}"; do
  echo "Building $f..."
  GOOS=linux GOARCH=amd64 go build -o "$f" "$f/main.go"
done

echo "Done building Go functions"
