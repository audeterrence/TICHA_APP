import api, { mockData, safeApiCall } from './api';

export interface TopicMastery {
  id: string;
  name: string;
  mastery: number;
  attempted: number;
  correct: number;
}

export const getTopicMastery = async (subjectId: string): Promise<TopicMastery[]> => {
  const fallback = mockData.topics[subjectId as keyof typeof mockData.topics] || [];
  return safeApiCall<TopicMastery[]>(
    api.get(`/api/mastery?subject_id=${subjectId}`),
    fallback,
    `Retrieving mock topic mastery for subject: ${subjectId}`
  );
};

export const updateTopicMastery = async (topicId: string, correct: boolean): Promise<TopicMastery> => {
  return safeApiCall<TopicMastery>(
    api.post('/api/mastery', { topic_id: topicId, correct }),
    {
      id: topicId,
      name: 'Dynamic Topic',
      mastery: 75,
      attempted: 10,
      correct: 8,
    },
    'Updating topic mastery (local mockup)'
  );
};
