# Full-Stack Voice Cloning and Chat Application

This project combines a powerful F5-TTS voice cloning model on the backend with a modern Next.js and Tailwind CSS frontend. It allows users to clone a voice from an audio sample and then engage in a real-time chat with an AI whose responses are synthesized in the cloned voice.

## Features

- **Persistent Voice Storage**: Upload a voice sample once and it's saved forever. Voices are stored in a Docker volume and persist across application restarts.
- **Simple Voice Management**: An intuitive UI to upload new voices and select from a dropdown of previously saved ones.
- **High-Quality Voice Cloning**: Utilizes the F5-TTS model to create realistic voice clones from short audio samples.
- **Fast, Conversational AI**: Get instant text responses from the Groq LLM (Llama3-8b).
- **Seamless Audio Playback**: Voice responses are generated in the background and play automatically without interrupting the chat flow.
- **One-Command Setup**: The entire application is containerized with Docker Compose for an instant, hassle-free launch.

---

## Getting Started

### Prerequisites

- An Ubuntu-based Linux distribution (e.g., Ubuntu 20.04, 22.04).
- An NVIDIA GPU with corresponding drivers installed.

### 1. First-Time Machine Setup

If you are setting up a new machine, run the `full_setup.sh` script. This only needs to be done once per machine. It will install Docker, the NVIDIA Container Toolkit, and all other necessary dependencies.

```bash
chmod +x scripts/full_setup.sh
sudo ./scripts/full_setup.sh
```

After the script completes, it's a good idea to reboot your machine to ensure all changes take effect:

```bash
sudo reboot
```

### 2. Running the Application

Once your machine is set up, you can start the application with a single command. This script will handle everything, including prompting for your Groq API key if it's not already configured.

```bash
./scripts/start_app.sh
```

The first time you run this, it will build the Docker containers, which may take several minutes. Subsequent launches will be much faster.

Once the services are running, the frontend will be accessible at [http://localhost:3000](http://localhost:3000).



---

## How to Use

1.  **Open the Application**: Navigate to `http://localhost:3000` in your web browser.
2.  **Upload a Voice**: On the "Manage & Select Voice" screen, click "Choose File" to select a clear audio sample (`.wav` or `.mp3`). Then, click "Upload Voice". The voice will be saved and will appear in the dropdown menu.
3.  **Select a Voice**: Choose a previously uploaded voice from the dropdown menu.
4.  **Start Chatting**: Click "Start Chatting with Selected Voice" to proceed to the chat screen.
5.  **Converse**: Type your message and receive an instant text response, followed by the audio spoken in your selected voice.

---

## Project Structure

- **/F5-TTS**: Contains the backend voice cloning model and its Dockerfile.
- **/ux/voicefe**: Contains the Next.js frontend application, its Dockerfile, and API routes.
- **docker-compose.yml**: The main Docker Compose file that orchestrates the frontend and backend services.
- **README.md**: This file.
