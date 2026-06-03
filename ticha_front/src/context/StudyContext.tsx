import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { getStudyTasks, toggleTaskCompleted, getStudyPlans, createStudyPlan } from '../services/study';
import type { StudyPlan, Task as StudyTask } from '../services/study';

interface StudyContextType {
  plans: StudyPlan[];
  tasks: StudyTask[];
  loading: boolean;
  toggleTask: (taskId: string, currentCompleted: boolean, xpReward?: number) => Promise<void>;
  generatePlan: (subjects: string[], hoursPerDay: number) => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addPoints, refreshUser } = useAuth();
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [allPlans, allTasks] = await Promise.all([
        getStudyPlans().catch(() => []),
        getStudyTasks().catch(() => []),
      ]);
      setPlans(allPlans);
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load study data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  const toggleTask = async (taskId: string, currentCompleted: boolean, xpReward: number = 10) => {
    if (currentCompleted) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, completed: true, status: 'completed' } : t
      )
    );

    try {
      // Call backend to mark complete
      await toggleTaskCompleted(taskId);

      // Update XP in Supabase
      if (user) {
        // Get current progress
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('total_xp')
          .eq('user_id', user.id)
          .single();

        const newXP = (progressData?.total_xp || 0) + xpReward;

        await supabase
          .from('user_progress')
          .upsert(
            { user_id: user.id, total_xp: newXP, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          );

        // Update subject mastery
        const task = tasks.find(t => t.id === taskId);
        if (task?.subject) {
          const { data: subjectData } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', task.subject)
            .single();

          if (subjectData) {
            const { data: userSubject } = await supabase
              .from('user_subjects')
              .select('mastery')
              .eq('user_id', user.id)
              .eq('subject_id', subjectData.id)
              .single();

            const newMastery = Math.min((userSubject?.mastery || 0) + 5, 100);

            await supabase
              .from('user_subjects')
              .update({ mastery: newMastery })
              .eq('user_id', user.id)
              .eq('subject_id', subjectData.id);
          }
        }

        // Refresh auth context (updates XP, streak, points)
        await refreshUser();
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setTasks(previousTasks);
    }
  };

  const generatePlan = async (subjects: string[], hoursPerDay: number) => {
    setLoading(true);
    try {
      const newPlan = await createStudyPlan(subjects, hoursPerDay);
      setPlans((prev) => [newPlan, ...prev]);
      setTasks((prev) => [...newPlan.tasks, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to generate study plan:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <StudyContext.Provider value={{ plans, tasks, loading, toggleTask, generatePlan, refreshData }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};