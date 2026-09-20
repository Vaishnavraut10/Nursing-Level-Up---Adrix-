export interface TestSeries {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  duration: number; // in minutes
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  isFree: boolean;
  price?: number;
  topics: string[];
}

export const testSeries: TestSeries[] = [
  {
    id: 'ts1',
    title: 'Test Series 01',
    description: 'Foundation nursing concepts covering basic principles and patient care fundamentals.',
    questionCount: 50,
    duration: 45,
    difficulty: 'Easy',
    isFree: true,
    topics: [
      'Basic Nursing Principles',
      'Patient Assessment',
      'Vital Signs',
      'Documentation',
      'Infection Control',
      'Patient Safety'
    ]
  },
  {
    id: 'ts2',
    title: 'Test Series 02',
    description: 'Intermediate nursing practice focusing on medical-surgical and pharmacology concepts.',
    questionCount: 50,
    duration: 45,
    difficulty: 'Moderate',
    isFree: true,
    topics: [
      'Medical-Surgical Nursing',
      'Pharmacology Basics',
      'Medication Administration',
      'Wound Care',
      'Fluid & Electrolyte Balance',
      'Pre-Operative Care'
    ]
  },
  {
    id: 'ts3',
    title: 'Test Series 03',
    description: 'Advanced nursing concepts including specialized care and complex patient scenarios.',
    questionCount: 50,
    duration: 45,
    difficulty: 'Moderate',
    isFree: false,
    price: 199,
    topics: [
      'Critical Care Nursing',
      'Cardiovascular Disorders',
      'Respiratory Disorders',
      'Neurological Assessment',
      'Emergency Nursing',
      'Advanced Pharmacology'
    ]
  },
  {
    id: 'ts4',
    title: 'Test Series 04',
    description: 'Comprehensive nursing practice covering all major nursing specialties and advanced concepts.',
    questionCount: 50,
    duration: 45,
    difficulty: 'Hard',
    isFree: false,
    price: 199,
    topics: [
      'Pediatric Nursing',
      'Maternal Health',
      'Mental Health Nursing',
      'Community Health',
      'Geriatric Nursing',
      'Leadership & Management'
    ]
  },
  {
    id: 'ts5',
    title: 'Test Series 05',
    description: 'Final preparation test series simulating actual nursing competitive exam patterns.',
    questionCount: 50,
    duration: 45,
    difficulty: 'Hard',
    isFree: false,
    price: 199,
    topics: [
      'Comprehensive Review',
      'Mixed Specialty Questions',
      'Time Management Practice',
      'Exam Pattern Simulation',
      'Previous Year Questions',
      'High-Yield Topics'
    ]
  }
];

export const getTestSeriesById = (id: string): TestSeries | undefined => {
  return testSeries.find(series => series.id === id);
};

export const getFreeTestSeries = (): TestSeries[] => {
  return testSeries.filter(series => series.isFree);
};

export const getPaidTestSeries = (): TestSeries[] => {
  return testSeries.filter(series => !series.isFree);
};

export const getTestSeriesByDifficulty = (difficulty: 'Easy' | 'Moderate' | 'Hard'): TestSeries[] => {
  return testSeries.filter(series => series.difficulty === difficulty);
};