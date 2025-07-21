# Voice Service API Endpoints

This document outlines the API endpoints for the Next.js voice cloning and chat application.

---

## 1. Clone Voice Sample

Generates a sample audio file from a reference voice to allow the user to preview the cloned voice before starting a chat.

- **URL**: `/api/clone-sample`
- **Method**: `POST`
- **Request Body**: `FormData`
  - `referenceAudio`: The `.wav` or `.mp3` file of the voice to be cloned.
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "audioUrl": "/api/audio?path=..."
  }
  ```
- **Error Response (400/500)**:
  ```json
  {
    "success": false,
    "error": "Error message here"
  }
  ```

---

## 2. Get LLM Chat Response

Receives a user's text message and returns a text-only response from the Groq LLM. This endpoint is optimized for speed to provide an immediate textual reply.

- **URL**: `/api/chat`
- **Method**: `POST`
- **Request Body**: `JSON`
  ```json
  {
    "message": "User's chat message"
  }
  ```
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "llmResponse": "The AI's text response."
  }
  ```
- **Error Response (400/500)**:
  ```json
  {
    "success": false,
    "error": "Error message here"
  }
  ```

---

## 3. Generate Audio from Text

Generates an audio file from a given text string using the previously cloned voice. This is called in the background by the frontend after receiving a text response.

- **URL**: `/api/generate-audio`
- **Method**: `POST`
- **Request Body**: `FormData`
  - `referenceAudio`: The original reference audio file.
  - `text`: The text to be synthesized (e.g., the response from the LLM).
- **Success Response (200)**:
  ```json
  {
    "success": true,
    "audioUrl": "/api/audio?path=..."
  }
  ```
- **Error Response (400/500)**:
  ```json
  {
    "success": false,
    "error": "Error message here"
  }
  ```

---

## 4. Serve Audio File

Securely serves a generated audio file from the temporary server directory.

- **URL**: `/api/audio`
- **Method**: `GET`
- **Query Parameters**:
  - `path`: The URL-encoded path to the audio file in the temporary directory.
- **Success Response (200)**:
  - The raw audio data (`audio/wav`).
- **Error Response (404)**:
  - If the file is not found or the path is invalid.