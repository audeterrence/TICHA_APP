import api, { mockData, safeApiCall } from './api';

export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  topicCount: number;
  mastery: number;
}

export const getSubjects = async (): Promise<Subject[]> => {
  return safeApiCall<Subject[]>(
    api.get('/api/subjects'),
    mockData.subjects,
    'Retrieving mock curriculum subjects'
  );
};

export const createSubject = async (subject: Omit<Subject, 'id' | 'mastery' | 'topicCount'>): Promise<Subject> => {
  const newSubject = {
    ...subject,
    id: `subj_${Math.random().toString(36).substr(2, 9)}`,
    topicCount: 0,
    mastery: 0,
  };
  return safeApiCall<Subject>(
    api.post('/api/subjects', subject),
    newSubject,
    'Creating new subject (local mockup)'
  );
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/api/subjects/${id}`);
    return true;
  } catch (error) {
    console.warn(`[TICHA API] Delete subject ${id} failed, returning local success flag`, error);
    return true;
  }
};
