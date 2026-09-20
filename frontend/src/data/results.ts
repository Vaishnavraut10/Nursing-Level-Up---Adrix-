export interface TestResult {
  id: string;
  testSeriesId: string;
  testSeriesTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  timeTaken: string; // format: "MM:SS"
  date: string;
}

export const mockResults: TestResult[] = [
  {
    id: 'r1',
    testSeriesId: 'ts1',
    testSeriesTitle: 'Test Series 01',
    score: 42,
    totalQuestions: 50,
    percentage: 84,
    correct: 42,
    incorrect: 6,
    unanswered: 2,
    timeTaken: '38:24',
    date: '2 hours ago'
  },
  {
    id: 'r2',
    testSeriesId: 'ts2',
    testSeriesTitle: 'Test Series 02',
    score: 38,
    totalQuestions: 50,
    percentage: 76,
    correct: 38,
    incorrect: 8,
    unanswered: 4,
    timeTaken: '41:12',
    date: '1 day ago'
  },
  {
    id: 'r3',
    testSeriesId: 'ts1',
    testSeriesTitle: 'Test Series 01',
    score: 45,
    totalQuestions: 50,
    percentage: 90,
    correct: 45,
    incorrect: 3,
    unanswered: 2,
    timeTaken: '35:45',
    date: '3 days ago'
  }
];

export const getResultById = (id: string): TestResult | undefined => {
  return mockResults.find(result => result.id === id);
};

export const getResultsByTestSeriesId = (testSeriesId: string): TestResult[] => {
  return mockResults.filter(result => result.testSeriesId === testSeriesId);
};

export const getRecentResults = (limit: number = 5): TestResult[] => {
  return mockResults.slice(0, limit);
};