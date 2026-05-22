import { useState, useEffect } from 'react';
import { getSubjects } from '../services/subjects';
import type { Subject } from '../services/subjects';
import { getTopicMastery } from '../services/mastery';
import type { TopicMastery } from '../services/mastery';

export const useMastery = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<TopicMastery[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0 && !activeSubject) {
        setActiveSubject(data[0]);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (activeSubject) {
      const fetchTopics = async () => {
        setTopicsLoading(true);
        try {
          const data = await getTopicMastery(activeSubject.id);
          setTopics(data);
        } catch (err) {
          console.error(`Failed to load topics for subject ${activeSubject.id}:`, err);
        } finally {
          setTopicsLoading(false);
        }
      };
      fetchTopics();
    }
  }, [activeSubject]);

  return {
    subjects,
    loading,
    activeSubject,
    setActiveSubject,
    topics,
    topicsLoading,
    refreshSubjects: fetchSubjects,
  };
};
