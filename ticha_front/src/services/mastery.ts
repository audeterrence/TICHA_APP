// ticha_front/src/services/mastery.ts
import { api } from './api';

// This interface matches what the frontend components expect to render the charts
export interface TopicMastery {
  id: string;       // The topic UUID
  name: string;     // The title of the topic
  mastery: number;  // The calculated percentage
  attempted: number;
  correct: number;
}

export const getTopicMastery = async (subjectId: string): Promise<TopicMastery[]> => {
  // Axios appends this to the baseURL. 
  // It will hit http://127.0.0.1:8000/api/mastery?subject_id=xyz
  const response = await api.get(`/mastery?subject_id=${subjectId}`);
  return response.data;
};

export const updateTopicMastery = async (topicId: string, correct: boolean): Promise<TopicMastery> => {
  const response = await api.post('/mastery/update', { 
    topic_id: topicId, 
    correct: correct 
  });
  return response.data;
};