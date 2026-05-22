import axios from 'axios';

// Default FastAPI server URL, load from environment if available
export const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject JWT token into every request automatically
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('ticha_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// High-fidelity fallback mock data when the FastAPI backend is offline
export const mockData = {
  stats: {
    streak: 12,
    points: 1450,
    weeklyProgress: 78,
    studyHours: 15.4,
    rank: 4,
    totalStudents: 125,
    examBreakdown: {
      completed: 24,
      pending: 6,
      score: 84,
    },
  },
  subjects: [
    { id: 'math', name: 'Mathematics', code: 'MATH', icon: 'Calculator', topicCount: 8, mastery: 82 },
    { id: 'phys', name: 'Physics', code: 'PHYS', icon: 'Zap', topicCount: 6, mastery: 65 },
    { id: 'chem', name: 'Chemistry', code: 'CHEM', icon: 'FlaskConical', topicCount: 5, mastery: 48 },
    { id: 'eng', name: 'English Language', code: 'ENGL', icon: 'BookOpen', topicCount: 10, mastery: 90 },
    { id: 'hist', name: 'History', code: 'HIST', icon: 'Globe', topicCount: 4, mastery: 72 },
  ],
  topics: {
    math: [
      { id: 'm1', name: 'Quadratic Equations', mastery: 85, attempted: 45, correct: 38 },
      { id: 'm2', name: 'Trigonometry & Geometry', mastery: 90, attempted: 60, correct: 54 },
      { id: 'm3', name: 'Differential Calculus', mastery: 70, attempted: 30, correct: 21 },
      { id: 'm4', name: 'Probability & Statistics', mastery: 60, attempted: 20, correct: 12 },
    ],
    phys: [
      { id: 'p1', name: 'Mechanics & Dynamics', mastery: 75, attempted: 40, correct: 30 },
      { id: 'p2', name: 'Electromagnetism', mastery: 50, attempted: 35, correct: 18 },
      { id: 'p3', name: 'Optics & Wave Motion', mastery: 80, attempted: 25, correct: 20 },
    ],
    chem: [
      { id: 'c1', name: 'Organic Chemistry Basics', mastery: 40, attempted: 22, correct: 9 },
      { id: 'c2', name: 'Chemical Equilibrium', mastery: 55, attempted: 18, correct: 10 },
    ],
  },
  chatSessions: [
    { id: 'session_1', title: 'Calculus Help: Derivatives', subject: 'Mathematics', date: 'Yesterday' },
    { id: 'session_2', title: 'Newtonian Physics & Forces', subject: 'Physics', date: '3 days ago' },
    { id: 'session_3', title: 'Exam Strategies for GCE A-Level', subject: 'General', date: '1 week ago' },
  ],
  chatMessages: {
    session_1: [
      { id: 'm1', role: 'assistant', content: 'Hello! I am **Ticha**, your personal AI study assistant. How can I help you prepare for your Mathematics exam today?' },
      { id: 'm2', role: 'user', content: 'Can you explain the chain rule in calculus?' },
      { id: 'm3', role: 'assistant', content: 'Of course! The **Chain Rule** is a formula for finding the derivative of a composite function. \n\nIf you have a function like $f(g(x))$, its derivative is:\n\n$$\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)$$\n\n### 📝 Quick Example:\nLet\'s differentiate $y = (3x^2 + 5)^4$:\n1. **Outer function** $f(u) = u^4 \\implies f\'(u) = 4u^3$\n2. **Inner function** $g(x) = 3x^2 + 5 \\implies g\'(x) = 6x$\n\nCombining these yields:\n$$\\frac{dy}{dx} = 4(3x^2 + 5)^3 \\cdot (6x) = 24x(3x^2 + 5)^3$$\n\nDoes this make sense? Try solving $(2x + 1)^3$ and I will check your answer!' },
    ],
  },
  tasks: [
    { id: 't1', title: 'Solve 10 Trigonometry MCQs', subject: 'Mathematics', duration: '20 mins', completed: true, date: 'Today' },
    { id: 't2', title: 'Review Electromagnetism notes', subject: 'Physics', duration: '30 mins', completed: false, date: 'Today' },
    { id: 't3', title: 'Practice Organic Chemistry Nomenclature', subject: 'Chemistry', duration: '45 mins', completed: false, date: 'Today' },
    { id: 't4', title: 'Complete English Grammar Mock Paper', subject: 'English', duration: '1 hour', completed: false, date: 'Tomorrow' },
  ],
  leaderboard: [
    { rank: 1, name: 'Amadou Bello', points: 1980, streak: 24, level: 'BAC', avatarSeed: 'amadou' },
    { rank: 2, name: 'Sih Chantal', points: 1820, streak: 18, level: 'GCE A-Level', avatarSeed: 'chantal' },
    { rank: 3, name: 'Fosso Thierry', points: 1650, streak: 15, level: 'Probatoire', avatarSeed: 'thierry' },
    { rank: 4, name: 'You (Student)', points: 1450, streak: 12, level: 'BAC', avatarSeed: 'user', isSelf: true },
    { rank: 5, name: 'Ngando Ewane', points: 1390, streak: 9, level: 'GCE O-Level', avatarSeed: 'ewane' },
    { rank: 6, name: 'Bih Clara', points: 1210, streak: 8, level: 'BEPC', avatarSeed: 'clara' },
  ],
  questions: [
    {
      id: 'q1',
      question: 'Which of the following is the derivative of $f(x) = \\ln(x^2 + 3x)$?',
      options: [
        { key: 'A', text: '\\frac{1}{x^2 + 3x}' },
        { key: 'B', text: '\\frac{2x + 3}{x^2 + 3x}' },
        { key: 'C', text: '\\frac{2x}{x^2 + 3x}' },
        { key: 'D', text: '\\frac{2x + 3}{\\ln(x^2 + 3x)}' }
      ],
      correctAnswer: 'B',
      explanation: 'Using the Chain Rule, for a function $u = g(x)$, the derivative of $\\ln(u)$ is $\\frac{u\'}{u}$. Here, $u = x^2 + 3x$, so $u\' = 2x + 3$. Thus, the derivative is $\\frac{2x + 3}{x^2 + 3x}$.'
    },
    {
      id: 'q2',
      question: 'In Newtonian Physics, if a force of 15 N is applied to an object of mass 3 kg, what is the resulting acceleration?',
      options: [
        { key: 'A', text: '5 m/s²' },
        { key: 'B', text: '45 m/s²' },
        { key: 'C', text: '0.2 m/s²' },
        { key: 'D', text: '12 m/s²' }
      ],
      correctAnswer: 'A',
      explanation: 'Using Newton\'s Second Law of Motion: $F = ma \\implies a = \\frac{F}{m}$. Plugging in the values: $a = \\frac{15\\text{ N}}{3\\text{ kg}} = 5\\text{ m/s}^2$.'
    }
  ]
};

// Safe API caller utility with mock fallback logic
export async function safeApiCall<T>(
  apiPromise: Promise<{ data: T }>,
  fallbackValue: T,
  warningMessage = 'FastAPI Offline - Falling back to local data'
): Promise<T> {
  try {
    const response = await apiPromise;
    return response.data;
  } catch (error) {
    console.warn(`[TICHA API] ${warningMessage}`, error);
    // Add small delay to mimic network response for natural feel
    await new Promise((resolve) => setTimeout(resolve, 300));
    return fallbackValue;
  }
}

export default api;
