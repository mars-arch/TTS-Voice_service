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
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

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
dockerd > /var/log/dockerd.log 2>&1 &
sleep 5 # Wait for docker to start

echo "Testing Docker installation..."
docker run hello-world

# 6. Install NVIDIA Container Toolkit
echo "Installing NVIDIA Container Toolkit..."
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
  && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
  && curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt-get update
apt-get install -y nvidia-container-toolkit

# 7. Configure Docker to use the NVIDIA runtime
echo "Configuring Docker to use NVIDIA runtime..."
nvidia-ctk runtime configure --runtime=docker
echo "Docker daemon is already running."

# 8. Test NVIDIA Docker integration
echo "Testing NVIDIA Docker integration..."
docker run --rm --gpus all nvidia/cuda:12.1.0-base-ubuntu22.04 nvidia-smi

echo "Setup complete. Docker and NVIDIA Container Toolkit are installed and working."
