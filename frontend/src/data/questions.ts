export interface Question {
  id: string;
  testId: string;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation: string;
}

export const questions: Question[] = [
  {
    id: 'q1',
    testId: 't1',
    question: 'A patient is receiving heparin therapy for deep vein thrombosis. Which laboratory test should the nurse monitor to assess the effectiveness of heparin therapy?',
    options: [
      'Prothrombin time (PT)',
      'International normalized ratio (INR)',
      'Activated partial thromboplastin time (aPTT)',
      'Platelet count'
    ],
    correctAnswer: 2,
    explanation: 'aPTT is used to monitor heparin therapy. The therapeutic range for aPTT is typically 1.5 to 2.5 times the control value. PT and INR are used to monitor warfarin therapy.'
  },
  {
    id: 'q2',
    testId: 't1',
    question: 'Which intervention is most important for a patient with a chest tube following thoracic surgery?',
    options: [
      'Encourage deep breathing and coughing',
      'Keep the drainage system below the level of the chest',
      'Clamp the chest tube during transport',
      'Monitor the drainage system for air leaks'
    ],
    correctAnswer: 1,
    explanation: 'Keeping the drainage system below the chest level prevents backflow of drainage into the pleural space, which could cause infection or compromise lung re-expansion.'
  },
  {
    id: 'q3',
    testId: 't2',
    question: 'A patient with heart failure is prescribed digoxin. Which sign of digoxin toxicity should the nurse monitor for?',
    options: [
      'Hypertension',
      'Bradycardia',
      'Hyperglycemia',
      'Increased urine output'
    ],
    correctAnswer: 1,
    explanation: 'Bradycardia (heart rate < 60 bpm) is a common sign of digoxin toxicity. Other signs include nausea, vomiting, visual disturbances, and confusion.'
  },
  {
    id: 'q4',
    testId: 't3',
    question: 'Which class of medications is contraindicated in patients with asthma?',
    options: [
      'Beta-agonists',
      'Corticosteroids',
      'Beta-blockers',
      'Leukotriene modifiers'
    ],
    correctAnswer: 2,
    explanation: 'Beta-blockers can cause bronchoconstriction and are contraindicated in patients with asthma. Cardioselective beta-blockers may be used with caution in some cases.'
  },
  {
    id: 'q5',
    testId: 't4',
    question: 'Which immunization is recommended for all adults aged 65 and older?',
    options: [
      'MMR vaccine',
      'HPV vaccine',
      'Pneumococcal vaccine',
      'Varicella vaccine'
    ],
    correctAnswer: 2,
    explanation: 'Pneumococcal vaccine is recommended for all adults aged 65 and older to prevent pneumococcal disease, including pneumonia, meningitis, and bloodstream infections.'
  },
  {
    id: 'q6',
    testId: 't5',
    question: 'Which developmental milestone is expected in a 6-month-old infant?',
    options: [
      'Walking independently',
      'Sitting without support',
      'Speaking in sentences',
      'Using a pincer grasp'
    ],
    correctAnswer: 1,
    explanation: 'At 6 months, infants typically can sit without support. Walking independently occurs around 12 months, speaking in sentences around 2 years, and pincer grasp around 9 months.'
  }
];

export const getQuestionsByTestId = (testId: string): Question[] => {
  return questions.filter(question => question.testId === testId);
};

export const getQuestionById = (id: string): Question | undefined => {
  return questions.find(question => question.id === id);
};