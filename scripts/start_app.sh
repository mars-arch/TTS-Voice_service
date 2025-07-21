#!/bin/bash

# This script simplifies the process of setting up the environment and running the application with Docker Compose.
# It checks for the .env.local file, creates it if needed, adds a default PORT, and then starts the services.

set -e

# Define the path to the environment file relative to the project root
ENV_FILE="ux/voicefe/.env.local"
PORT_VAR="PORT=3000"

# Ensure the target directory exists
mkdir -p "$(dirname "$ENV_FILE")"

# Check if .env.local exists, create it if not.
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Add the PORT variable if it's not already in the file.
if ! grep -q "^${PORT_VAR}$" "$ENV_FILE"; then
    echo "Adding $PORT_VAR to $ENV_FILE..."
    echo "$PORT_VAR" >> "$ENV_FILE"
fi

# Check for GROQ_API_KEY and prompt if not found
if ! grep -q "^GROQ_API_KEY=" "$ENV_FILE"; then
    echo "GROQ_API_KEY not found in $ENV_FILE."
    read -p "Please enter your Groq API key: " GROQ_API_KEY
    if [ -n "$GROQ_API_KEY" ]; then
        echo "Adding GROQ_API_KEY to $ENV_FILE..."
        echo "GROQ_API_KEY=${GROQ_API_KEY}" >> "$ENV_FILE"
    else
        echo "No Groq API key provided. The application may not function correctly."
    fi
fi

# Run docker-compose
echo "Starting the application with Docker Compose..."
docker compose up
