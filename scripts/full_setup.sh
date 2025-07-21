#!/bin/bash

# This script performs a full setup for a new machine, including installing Docker.

set -e

# 1. Update and install prerequisites
echo "Updating package lists and installing prerequisites..."
apt-get update
apt-get install -y ca-certificates curl gnupg

# 2. Add Docker's GPG key
echo "Adding Docker's GPG key..."
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
else
    echo "Docker GPG key already exists, skipping."
fi

# 3. Add Docker repository
echo "Adding Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker
echo "Installing Docker..."
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Start and Test Docker
echo "Starting Docker daemon..."
if ! pgrep -x "dockerd" > /dev/null; then
    echo "Starting Docker daemon..."
    dockerd > /var/log/dockerd.log 2>&1 &
    # Wait for the Docker socket to be available
    while [ ! -S /var/run/docker.sock ]; do
        echo "Waiting for Docker socket..."
        sleep 1
    done
    echo "Docker daemon started."
else
    echo "Docker daemon is already running."
fi

# 6. Install NVIDIA Container Toolkit
echo "Installing NVIDIA Container Toolkit..."
if [ ! -f /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg ]; then
    distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
      && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
      && curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
        sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
        tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
else
    echo "NVIDIA GPG key and repo list already exist, skipping."
fi
  

apt-get update
apt-get install -y nvidia-container-toolkit

# 7. Configure Docker to use the NVIDIA runtime
echo "Configuring Docker to use NVIDIA runtime..."
nvidia-ctk runtime configure --runtime=docker

echo "Restarting Docker daemon to apply NVIDIA runtime configuration..."
# Kill the existing docker daemon process to ensure a clean restart
pkill dockerd || true
sleep 5 # Give it a moment to shut down before restarting

# Start the daemon again
dockerd > /var/log/dockerd.log 2>&1 &

# Wait for the Docker socket to be available again
while [ ! -S /var/run/docker.sock ]; do
    echo "Waiting for Docker socket after restart..."
    sleep 1
done
echo "Docker daemon restarted successfully."

# 8. Test Docker and NVIDIA Integration
echo "Testing Docker installation..."
docker run hello-world

echo "Testing NVIDIA Docker integration..."
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi

echo "Setup complete. Docker and NVIDIA Container Toolkit are installed and working."
