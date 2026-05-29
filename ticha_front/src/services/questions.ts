// ticha_front/src/services/questions.ts
import { api } from './api';

export interface QuizQuestion {
  id: string;
  topic_id: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export const getQuestionsByTopic = async (topicId?: string): Promise<QuizQuestion[]> => {
  // If a topicId is provided, fetch questions for that topic. 
  // Otherwise, fetch a general random set.
  const url = topicId ? `/questions?topic_id=${topicId}` : '/questions/random';
  const response = await api.get(url);
  return response.data;
};