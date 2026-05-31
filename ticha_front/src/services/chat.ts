// ticha_front/src/services/chat.ts
import { api } from './api';

export interface ChatSession {
  id: string;
  title?: string;
  subject_id: string;
  subject: string;     
  date: string;         
  status: string;
  created_at?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export const getChatSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

export const createChatSession = async (subject_id: string, title?: string): Promise<ChatSession> => {
  const response = await api.post('/chat/sessions', { 
    subject_id: subject_id, 
    title: title 
  });
  return response.data;
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  const response = await api.get(`/chat/messages?session_id=${sessionId}`);
  return response.data;
};

export const sendChatMessage = async (sessionId: string, content: string): Promise<ChatMessage> => {
  // We send the user's message to FastAPI. 
  // FastAPI handles saving it, querying the real AI, and returning the AI's response.
  const response = await api.post('/chat/messages', { 
    session_id: sessionId, 
    content: content 
  });
  return response.data;
};