export interface Test {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number; // in minutes
  passingScore: number;
}

export const tests: Test[] = [
  {
    id: 't1',
    courseId: '1',
    title: 'Medical-Surgical Nursing Assessment',
    description: 'Test your knowledge of medical-surgical nursing principles and patient assessment.',
    questionCount: 50,
    duration: 60,
    passingScore: 70
  },
  {
    id: 't2',
    courseId: '1',
    title: 'Cardiovascular Nursing Practice',
    description: 'Focused test on cardiovascular system disorders and nursing interventions.',
    questionCount: 30,
    duration: 40,
    passingScore: 70
  },
  {
    id: 't3',
    courseId: '2',
    title: 'Pharmacology Fundamentals',
    description: 'Test your understanding of drug classifications and nursing considerations.',
    questionCount: 40,
    duration: 50,
    passingScore: 70
  },
  {
    id: 't4',
    courseId: '3',
    title: 'Community Health Assessment',
    description: 'Assessment of community health concepts and public health nursing.',
    questionCount: 35,
    duration: 45,
    passingScore: 70
  },
  {
    id: 't5',
    courseId: '4',
    title: 'Pediatric Nursing Fundamentals',
    description: 'Test your knowledge of pediatric nursing care and child development.',
    questionCount: 30,
    duration: 40,
    passingScore: 70
  }
];

export const getTestsByCourseId = (courseId: string): Test[] => {
  return tests.filter(test => test.courseId === courseId);
};

export const getTestById = (id: string): Test | undefined => {
  return tests.find(test => test.id === id);
};