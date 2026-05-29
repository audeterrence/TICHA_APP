// ticha_front/src/services/study.ts
import { api } from './api';

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  task_type: 'reading' | 'quiz' | 'mock_exam';
  status: 'pending' | 'completed';
  scheduled_date: string;
}

export interface StudyPlan {
  id: string;
  profile_id: string;
  target_date: string;
  tasks: Task[];
}

export const getStudyPlans = async (): Promise<StudyPlan[]> => {
  try {
    const response = await api.get('/study-plans/current');
    return [response.data];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

export const getCurrentPlan = async (): Promise<StudyPlan> => {
  const response = await api.get('/study-plans/current');
  return response.data;
};

export const getStudyTasks = async (planId?: string): Promise<Task[]> => {
  try {
    const response = await api.get('/study-plans/current');
    return response.data.tasks || [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

export const createStudyPlan = async (targetDate?: string): Promise<StudyPlan> => {
  const response = await api.post('/study-plans', { target_date: targetDate });
  return response.data;
};

// RENAMED: Changed from completeTask to toggleTaskCompleted
export const toggleTaskCompleted = async (taskId: string): Promise<{ message: string; task: Task }> => {
  const response = await api.put(`/study-plans/tasks/${taskId}/complete`);
  return response.data;
};