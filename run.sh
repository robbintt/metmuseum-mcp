#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define image name
IMAGE_NAME="met-museum-mcp"

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME..."
docker build -t "$IMAGE_NAME" .

# Define the application port, using METMUSEUM_MCP_PORT if set, otherwise default to 8000
APP_PORT=${METMUSEUM_MCP_PORT:-8000}

# Run the Docker container
echo "Running Docker container: $IMAGE_NAME on port $APP_PORT..."
docker run -e "METMUSEUM_MCP_PORT=${APP_PORT}" -p "${APP_PORT}:${APP_PORT}" "$IMAGE_NAME"
