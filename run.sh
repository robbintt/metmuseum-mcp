#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define image name
IMAGE_NAME="met-museum-mcp"

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

# Run the Docker container
echo "Running Docker container: $IMAGE_NAME..."
docker run -p 8000:8000 "$IMAGE_NAME"
