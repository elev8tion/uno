import { v4 as uuidv4 } from 'uuid';
import { getToken } from '../utils/auth';
import { WS_URL } from '../utils/constants';

export class SpeechConnection {
  private socket: WebSocket;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording: boolean = false;
  private onTranscript: (text: string) => void;
  private onError: (error: string) => void;

  constructor(
    onTranscript: (text: string) => void,
    onError: (error: string) => void
  ) {
    this.onTranscript = onTranscript;
    this.onError = onError;
    this.socket = new WebSocket('wss://api.elev8tion.com/ws');
  }

  async connect() {
    try {
      const token = getToken();
      if (!token) {
        this.onError('No authentication token found');
        return;
      }

      this.socket = new WebSocket(`${WS_URL}/ws/${uuidv4()}?token=${token}`);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.startRecording();
      };

      this.socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          const audioBlob = new Blob([event.data], { type: 'audio/mp3' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          await audio.play();
        } else {
          const data = JSON.parse(event.data);
          if (data.transcript) {
            this.onTranscript(data.transcript);
          }
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.onError('WebSocket connection error');
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
    } catch (error) {
      console.error('Connection error:', error);
      this.onError('Failed to connect to WebSocket');
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(event.data);
          }
        }
      };

      this.mediaRecorder.start(100); // Send data every 100ms
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  disconnect() {
    this.stopRecording();
    if (this.socket) {
      this.socket.close();
    }
  }
} 