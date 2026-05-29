// ticha_front/src/services/subjects.ts
import { api } from './api';

export interface Subject {
  id: string;
  name: string;
  // We make these optional because our new Database schema relies on actual relations 
  // rather than hardcoded icons and codes.
  code?: string;
  icon?: string;
  topicCount?: number;
  mastery?: number;
  level_target?: string;
}

export const getSubjects = async (): Promise<Subject[]> => {
  // Axios automatically appends this to the baseURL, making it /api/subjects
  const response = await api.get('/subjects'); 
  return response.data;
};

export const createSubject = async (subject: Partial<Subject>): Promise<Subject> => {
  const response = await api.post('/subjects', subject);
  return response.data;
};

export const deleteSubject = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/subjects/${id}`);
    return true;
  } catch (error) {
    console.error(`[TICHA API] Delete subject ${id} failed`, error);
    return false;
  }
};