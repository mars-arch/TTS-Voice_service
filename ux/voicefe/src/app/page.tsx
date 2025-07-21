"use client";

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

type AppState = 'voice_selection' | 'chatting';

export default function Home() {
  // App State
  const [appState, setAppState] = useState<AppState>('voice_selection');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice Management State
  const [voices, setVoices] = useState<string[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch voices on component mount
  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/voices');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0]);
        }
      } else {
        setError('Failed to fetch voices.');
      }
    } catch (err) {
      setError('An error occurred while fetching voices.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleUploadVoice = async () => {
    if (!uploadFile) return;
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('voiceSample', uploadFile);

    try {
      const response = await fetch('/api/voices', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        await fetchVoices(); // Refresh the voice list
        alert('Voice uploaded successfully!');
      } else {
        setError(`Error uploading voice: ${result.error}`);
      }
    } catch (err) {
      setError('An unexpected error occurred during upload.');
    }
    setIsLoading(false);
  };

  const handleStartChatting = () => {
    if (!selectedVoice) {
      setError('Please select a voice to start chatting.');
      return;
    }
    setAppState('chatting');
  };

  const handleSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userInput.trim() || !selectedVoice) return;

    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const textResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });
      const textResult = await textResponse.json();

      setIsLoading(false);

      if (textResult.success) {
        const assistantMessage: Message = { role: 'assistant', text: textResult.llmResponse };
        setMessages(prev => [...prev, assistantMessage]);
        generateAndPlayAudio(textResult.llmResponse, selectedVoice);
      } else {
        setError(`Chat Error: ${textResult.error}`);
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred during chat.');
    }
  };

  const generateAndPlayAudio = async (text: string, voiceId: string) => {
    try {
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
      const audioResult = await audioResponse.json();

      if (audioResult.success && audioRef.current) {
        audioRef.current.src = audioResult.audioUrl;
        audioRef.current.play().catch(e => console.error("Audio playback failed", e));
      }
    } catch (error) {
      console.error('Audio generation API error:', error);
    }
  };

  const renderVoiceSelection = () => (
    <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-white">Manage & Select Voice</h2>
      
      {/* Upload New Voice Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Upload a New Voice</h3>
        <input type="file" accept=".wav,.mp3" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        <button onClick={handleUploadVoice} disabled={!uploadFile || isLoading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
          {isLoading ? 'Uploading...' : 'Upload Voice'}
        </button>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Select Existing Voice Section */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Select an Existing Voice</h3>
        <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
          {voices.length === 0 ? (
            <option>No voices uploaded yet</option>
          ) : (
            voices.map(voice => <option key={voice} value={voice}>{voice}</option>)
          )}
        </select>
      </div>

      <button onClick={handleStartChatting} disabled={!selectedVoice} className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-500">
        Start Chatting with Selected Voice
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col w-full h-[90vh] max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Chatting with: <span className='text-blue-400'>{selectedVoice}</span></h2>
            <button onClick={() => setAppState('voice_selection')} className='px-3 py-1 text-sm bg-gray-600 hover:bg-gray-700 rounded'>Change Voice</button>
        </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 rounded-lg bg-gray-700 text-white">
                Typing...
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
            Send
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-8">Voice Cloning Chat</h1>
      {appState === 'voice_selection' ? renderVoiceSelection() : renderChat()}
      <audio ref={audioRef} className="hidden" />
    </main>
  );
}
