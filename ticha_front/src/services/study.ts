import api, { mockData, safeApiCall } from './api';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  duration: string;
  completed: boolean;
  date: string;
}

export interface StudyPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  tasks: StudyTask[];
}

export const getStudyPlans = async (): Promise<StudyPlan[]> => {
  const fallback: StudyPlan[] = [
    {
      id: 'plan_1',
      title: 'Weekly Exam Prep Plan',
      startDate: '2026-05-22',
      endDate: '2026-05-29',
      tasks: mockData.tasks,
    },
  ];
  return safeApiCall<StudyPlan[]>(
    api.get('/api/study/plans'),
    fallback,
    'Retrieving active mock study plans'
  );
};

export const getStudyTasks = async (): Promise<StudyTask[]> => {
  return safeApiCall<StudyTask[]>(
    api.get('/api/study/tasks'),
    mockData.tasks,
    'Retrieving daily mock tasks checklist'
  );
};

export const toggleTaskCompleted = async (taskId: string, completed: boolean): Promise<StudyTask | null> => {
  try {
    const response = await api.patch(`/api/study/tasks/${taskId}`, { completed });
    return response.data;
  } catch (error) {
    console.warn(`[TICHA API] Patch task ${taskId} failed, updating local state only`, error);
    const localTask = mockData.tasks.find((t) => t.id === taskId);
    if (localTask) {
      return { ...localTask, completed };
    }
    return null;
  }
};

export const createStudyPlan = async (subjects: string[], hoursPerDay: number): Promise<StudyPlan> => {
  const newPlan: StudyPlan = {
    id: `plan_${Math.random().toString(36).substr(2, 9)}`,
    title: `AI Plan for ${subjects.join(', ')}`,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tasks: subjects.flatMap((subj, index) => [
      {
        id: `task_${subj}_${index}_1`,
        title: `Deep dive into ${subj} basics`,
        subject: subj,
        duration: `${hoursPerDay * 30} mins`,
        completed: false,
        date: 'Today',
      },
      {
        id: `task_${subj}_${index}_2`,
        title: `Solve ${subj} mock papers`,
        subject: subj,
        duration: `${hoursPerDay * 30} mins`,
        completed: false,
        date: 'Tomorrow',
      },
    ]),
  };

  return safeApiCall<StudyPlan>(
    api.post('/api/study/plans', { subjects, hours_per_day: hoursPerDay }),
    newPlan,
    'Requesting AI to auto-generate weekly study plan (mock fallback)'
  );
};

export const startStudySession = async (subject: string): Promise<string> => {
  try {
    const response = await api.post('/api/study/sessions/start', { subject });
    return response.data.id || 'sess_123';
  } catch (error) {
    console.warn('[TICHA API] Start study session failed, returning mock session ID', error);
    return 'sess_mock_active';
  }
};

export const endStudySession = async (sessionId: string, durationMinutes: number): Promise<boolean> => {
  try {
    await api.patch(`/api/study/sessions/${sessionId}/end`, { duration_minutes: durationMinutes });
    return true;
  } catch (error) {
    console.warn(`[TICHA API] End study session ${sessionId} failed, local return success`, error);
    return true;
  }
};
