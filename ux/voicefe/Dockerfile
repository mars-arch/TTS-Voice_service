# Use the official Node.js image as a base
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# The F5-TTS model is in a parent directory, so we need to reference it.
# This Docker Compose setup will handle the volume mounting.

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "dev"]
