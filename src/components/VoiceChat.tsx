import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SpeechConnection } from '../services/SpeechConnection';
import '../styles/VoiceChat.css';
import { UserState } from '../types';
import { getToken, setToken, setUserId } from '../utils/auth';
import { BACKEND_URL } from '../utils/constants';
import AudioVisualizer from './AudioVisualizer';

const VoiceChat: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [metrics, setMetrics] = useState({
    latency: 0,
    frameDrops: 0,
    reconnects: 0
  });
  const speechConnection = useRef<SpeechConnection | null>(null);

  useEffect(() => {
    // Initialize token from environment
    const token = import.meta.env.VITE_JWT_TOKEN;
    if (token) {
      setToken(token);
      setUserId('user_' + uuidv4().slice(0, 8));
    }

    // Check user state
    const checkUserState = async () => {
      try {
        const token = getToken();
        if (!token) throw new Error('No token found');

        const response = await fetch(`${BACKEND_URL}/user/state`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to get user state');
        const data = await response.json();
        setUserState(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkUserState();

    // Initialize speech connection with audio level monitoring
    speechConnection.current = new SpeechConnection(
      (text: string) => {
        console.log('Transcript:', text);
      },
      (error: string) => {
        setError(error);
        setIsRecording(false);
      }
    );

    // Start metrics monitoring
    const metricsInterval = setInterval(() => {
      if (speechConnection.current && isRecording) {
        // Simulate metrics for now - replace with actual metrics when available
        setMetrics(prev => ({
          latency: Math.random() * 50 + 20,
          frameDrops: prev.frameDrops + (Math.random() > 0.9 ? 1 : 0),
          reconnects: prev.reconnects
        }));
        // Simulate audio level - replace with actual audio level when available
        setAudioLevel(Math.random());
      }
    }, 100);

    return () => {
      clearInterval(metricsInterval);
      if (speechConnection.current) {
        speechConnection.current.disconnect();
      }
    };
  }, []);

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        if (speechConnection.current) {
          speechConnection.current.disconnect();
        }
        setIsRecording(false);
      } else {
        await speechConnection.current?.connect();
        setIsRecording(true);
        setIsConnected(true);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle recording');
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <AudioVisualizer level={audioLevel} />
        </div>

        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleToggleRecording}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}

          <div className="text-sm text-gray-600 mt-4">
            <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
            <div>Latency: {metrics.latency.toFixed(2)}ms</div>
            <div>Frame Drops: {metrics.frameDrops}</div>
            <div>Reconnects: {metrics.reconnects}</div>
            {userState && <div>Session: {userState.session_id}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChat; 