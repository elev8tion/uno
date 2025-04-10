import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SpeechConnection } from '../services/SpeechConnection';
import '../styles/VoiceChat.css';
import { UserState } from '../types';
import { getToken, setToken, setUserId } from '../utils/auth';
import { BACKEND_URL } from '../utils/constants';

const VoiceChat: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [error, setError] = useState<string | null>(null);
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

    speechConnection.current = new SpeechConnection(
      (text: string) => {
        // Handle transcript
        console.log('Transcript:', text);
      },
      (error: string) => {
        // Handle error
        console.error('Error:', error);
      }
    );

    return () => {
      if (speechConnection.current) {
        speechConnection.current.disconnect();
      }
    };
  }, []);

  const handleStart = async () => {
    try {
      await speechConnection.current?.connect();
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const handleStop = () => {
    if (speechConnection.current) {
      speechConnection.current.disconnect();
      setIsConnected(false);
    }
  };

  return (
    <div className="voice-chat-container">
      <h1>Voice Chat</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {userState && (
        <div className="user-state">
          <p>Session: {userState.session_id}</p>
          <p>Active: {userState.has_active_session ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div className="controls">
        {!isConnected ? (
          <button onClick={handleStart} className="start-button">
            Start Voice Chat
          </button>
        ) : (
          <button onClick={handleStop} className="stop-button">
            Stop Voice Chat
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceChat; 