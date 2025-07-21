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

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.
- An NVIDIA GPU with CUDA drivers is required for the voice cloning model.

### Instructions

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-username/Voice-Service.git
    cd Voice-Service
    ```

2.  **Set Up Environment Variables**

    Navigate to the frontend directory, create a `.env.local` file from the example, and add your Groq API key.

    ```bash
    cd ux/voicefe
    cp .env.example .env.local
    ```

    Now, open `.env.local` with a text editor and replace `"YOUR_GROQ_API_KEY_HERE"` with your actual Groq API key.

3.  **Launch the Application**

    Return to the root `Voice-Service` directory and run the application using Docker Compose. The `--build` flag is only needed the first time or when code changes.

    ```bash
    cd ../../ # Return to the root directory from ux/voicefe
    docker-compose up --build
    ```

    The initial build may take some time as it needs to download the model files.

4.  **Access the Application**

    Once the containers are running, you can access the web interface in your browser at:
    [**http://localhost:3000**](http://localhost:3000)

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
