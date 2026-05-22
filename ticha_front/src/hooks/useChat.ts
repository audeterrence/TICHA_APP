import { useState, useEffect } from 'react';
import { getChatSessions, createChatSession, getChatMessages, sendChatMessage } from '../services/chat';
import type { ChatSession, ChatMessage } from '../services/chat';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Load chat sessions on startup
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await getChatSessions();
      setSessions(data);
      if (data.length > 0 && !activeSession) {
        setActiveSession(data[0]);
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Load messages whenever active session changes
  useEffect(() => {
    if (activeSession) {
      const fetchMessages = async () => {
        setMessagesLoading(true);
        try {
          const data = await getChatMessages(activeSession.id);
          setMessages(data);
        } catch (err) {
          console.error(`Failed to load messages for session ${activeSession.id}:`, err);
        } finally {
          setMessagesLoading(false);
        }
      };
      fetchMessages();
    }
  }, [activeSession]);

  const handleStartSession = async (subject: string, title?: string) => {
    setLoading(true);
    try {
      const newSession = await createChatSession(subject, title);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSession(newSession);
      return newSession;
    } catch (err) {
      console.error('Failed to create new chat session:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSession || !content.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content,
    };

    // 1. Add user message to UI immediately (optimistic update)
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      // 2. Transmit to API and fetch AI response
      const response = await sendChatMessage(activeSession.id, content);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Failed to send message to AI Tutor:', err);
      // Optional: add error message bubble in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: '⚠️ *Sorry, I am having trouble connecting to the brain. Please ensure FastAPI is running!*',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return {
    sessions,
    activeSession,
    setActiveSession,
    messages,
    loading,
    sending,
    messagesLoading,
    startSession: handleStartSession,
    sendMessage: handleSendMessage,
    refreshSessions: fetchSessions,
  };
};
