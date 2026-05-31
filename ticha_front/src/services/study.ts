// ticha_front/src/services/study.ts
import { api } from './api';

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  task_type: 'reading' | 'quiz' | 'mock_exam';
  status: 'pending' | 'completed';
  scheduled_date: string;
  // Additional fields expected by the frontend (mapped from backend)
  date?: string;      // display-friendly, e.g., "Today", "Tomorrow"
  subject?: string;   // extracted from task title
  duration?: string;  // mocked or derived
  completed?: boolean; // derived from status
}

export interface StudyPlan {
  id: string;
  profile_id: string;
  target_date: string;
  title: string;           // added
  start_date?: string;     // computed: today
  end_date?: string;       // same as target_date
  tasks: Task[];
}

export const getStudyPlans = async (): Promise<StudyPlan[]> => {
  try {
    const response = await api.get('/study-plans/current');
    // add computed fields to match frontend expectations
    const plan = response.data;
    plan.title = plan.title || `Plan until ${plan.target_date}`;
    plan.start_date = new Date().toISOString().split('T')[0];
    plan.end_date = plan.target_date;
    plan.tasks = plan.tasks.map((task: any) => ({
      ...task,
      completed: task.status === 'completed',
      // naive extraction of subject from title (e.g., "Reading: Mathematics - Day 1")
      subject: task.title.split(':')[1]?.split('-')[0]?.trim() || 'General',
      duration: '30 min', // default
      date: getDateLabel(task.scheduled_date)
    }));
    return [plan];
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
    const tasks = response.data.tasks || [];
    // enrich tasks with frontend fields
    return tasks.map((task: any) => ({
      ...task,
      completed: task.status === 'completed',
      subject: task.title.split(':')[1]?.split('-')[0]?.trim() || 'General',
      duration: '30 min',
      date: getDateLabel(task.scheduled_date)
    }));
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return [];
    }
    throw error;
  }
};

// Helper to convert scheduled_date to "Today", "Tomorrow", or formatted date
function getDateLabel(scheduledDate: string): string {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  if (scheduledDate === today) return 'Today';
  if (scheduledDate === tomorrow) return 'Tomorrow';
  return new Date(scheduledDate).toLocaleDateString();
}

// Updated createStudyPlan to accept subjects and hoursPerDay
export const createStudyPlan = async (
  subjects: string[],
  hoursPerDay: number,
  targetDate?: string
): Promise<StudyPlan> => {
  const response = await api.post('/study-plans', {
    subjects,
    hours_per_day: hoursPerDay,
    target_date: targetDate
  });
  const plan = response.data;
  // add computed fields
  plan.title = plan.title || `Plan until ${plan.target_date}`;
  plan.start_date = new Date().toISOString().split('T')[0];
  plan.end_date = plan.target_date;
  plan.tasks = plan.tasks.map((task: any) => ({
    ...task,
    completed: task.status === 'completed',
    subject: task.title.split(':')[1]?.split('-')[0]?.trim() || 'General',
    duration: '30 min',
    date: getDateLabel(task.scheduled_date)
  }));
  return plan;
};

export const toggleTaskCompleted = async (taskId: string): Promise<{ message: string; task: Task }> => {
  const response = await api.put(`/study-plans/tasks/${taskId}/complete`);
  // toggle status between 'pending' and 'completed'
  const updatedTask = response.data.task;
  updatedTask.completed = updatedTask.status === 'completed';
  updatedTask.subject = updatedTask.title.split(':')[1]?.split('-')[0]?.trim() || 'General';
  updatedTask.duration = '30 min';
  updatedTask.date = getDateLabel(updatedTask.scheduled_date);
  return { message: response.data.message, task: updatedTask };
};