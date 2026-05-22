import { useState, useEffect } from 'react';
import { getStudyPlans, getStudyTasks, toggleTaskCompleted, createStudyPlan } from '../services/study';
import type { StudyPlan, StudyTask } from '../services/study';

export const useStudyPlans = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlannerData = async () => {
    setLoading(true);
    try {
      const [allPlans, allTasks] = await Promise.all([getStudyPlans(), getStudyTasks()]);
      setPlans(allPlans);
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load study planner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlannerData();
  }, []);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !currentCompleted } : t))
    );

    try {
      const updated = await toggleTaskCompleted(taskId, !currentCompleted);
      if (!updated) {
        setTasks(previousTasks);
      }
    } catch (err) {
      console.error(`Failed to toggle task ${taskId}:`, err);
      setTasks(previousTasks);
    }
  };

  const handleGeneratePlan = async (subjects: string[], hoursPerDay: number) => {
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

  return {
    plans,
    tasks,
    loading,
    toggleTask: handleToggleTask,
    generatePlan: handleGeneratePlan,
    refreshPlanner: loadPlannerData,
  };
};
