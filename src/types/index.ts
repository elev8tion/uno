export interface UserState {
  has_active_session: boolean;
  session_id: string;
  last_processed: string | null;
  processing_time: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
} 