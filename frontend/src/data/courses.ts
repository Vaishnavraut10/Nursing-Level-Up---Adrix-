export interface Course {
  id: string;
  name: string;
  description: string;
  image: string;
  mcqCount: number;
  testCount: number;
  price: number;
  category: string;
  topics: string[];
}

export const courses: Course[] = [
  {
    id: '1',
    name: 'Medical-Surgical Nursing',
    description: 'Comprehensive coverage of medical-surgical nursing principles and patient care across various conditions.',
    image: '/images/med-surg.jpg',
    mcqCount: 450,
    testCount: 12,
    price: 2999,
    category: 'Core Nursing',
    topics: [
      'Cardiovascular System',
      'Respiratory System',
      'Gastrointestinal System',
      'Endocrine System',
      'Neurological System',
      'Immune System'
    ]
  },
  {
    id: '2',
    name: 'Pharmacology',
    description: 'Study drug classifications, actions, side effects, and nursing considerations for safe medication administration.',
    image: '/images/pharmacology.jpg',
    mcqCount: 380,
    testCount: 10,
    price: 2499,
    category: 'Pharmacology',
    topics: [
      'Antibiotics',
      'Cardiovascular Drugs',
      'Respiratory Drugs',
      'Gastrointestinal Drugs',
      'Central Nervous System Drugs',
      'Endocrine Drugs'
    ]
  },
  {
    id: '3',
    name: 'Community Health Nursing',
    description: 'Focus on community health assessment, epidemiology, and public health nursing interventions.',
    image: '/images/community-health.jpg',
    mcqCount: 320,
    testCount: 8,
    price: 1999,
    category: 'Community',
    topics: [
      'Epidemiology',
      'Health Assessment',
      'Family Health',
      'Environmental Health',
      'Communicable Diseases',
      'Health Programs'
    ]
  },
  {
    id: '4',
    name: 'Pediatric Nursing',
    description: 'Specialized care for infants, children, and adolescents with age-appropriate nursing interventions.',
    image: '/images/pediatric.jpg',
    mcqCount: 290,
    testCount: 8,
    price: 2299,
    category: 'Specialty',
    topics: [
      'Growth and Development',
      'Newborn Care',
      'Common Childhood Illnesses',
      'Pediatric Medications',
      'Nutrition',
      'Immunizations'
    ]
  },
  {
    id: '5',
    name: 'Mental Health Nursing',
    description: 'Understanding mental health disorders, therapeutic communication, and psychiatric nursing care.',
    image: '/images/mental-health.jpg',
    mcqCount: 260,
    testCount: 7,
    price: 2199,
    category: 'Specialty',
    topics: [
      'Anxiety Disorders',
      'Mood Disorders',
      'Schizophrenia',
      'Substance Use Disorders',
      'Therapeutic Communication',
      'Crisis Intervention'
    ]
  },
  {
    id: '6',
    name: 'Maternal and Newborn Nursing',
    description: 'Comprehensive care during pregnancy, childbirth, and the postpartum period for both mother and newborn.',
    image: '/images/maternal.jpg',
    mcqCount: 340,
    testCount: 9,
    price: 2599,
    category: 'Specialty',
    topics: [
      'Antepartum Care',
      'Intrapartum Care',
      'Postpartum Care',
      'Newborn Assessment',
      'High-Risk Pregnancy',
      'Lactation'
    ]
  }
];

export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id);
};

export const getCoursesByCategory = (category: string): Course[] => {
  return courses.filter(course => course.category === category);
};