'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/layouts/AdminLayout';

export default function AttemptDetailPage() {
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock attempt detail data
    setAttempt({
      id: 1,
      user_name: 'Rahul Sharma',
      user_email: 'student1@example.com',
      test_series_title: 'Test Series 01',
      score: 42,
      total_questions: 50,
      correct_answers: 42,
      incorrect_answers: 6,
      unanswered: 2,
      time_taken: 1800,
      started_at: '2024-01-13 10:00',
      submitted_at: '2024-01-13 10:30',
      status: 'COMPLETED'
    });
    
    setAnswers([
      {
        id: 1,
        question_text: 'A patient is receiving heparin therapy for deep vein thrombosis. Which laboratory test should the nurse monitor?',
        option_a: 'Prothrombin time (PT)',
        option_b: 'International normalized ratio (INR)',
        option_c: 'Activated partial thromboplastin time (aPTT)',
        option_d: 'Platelet count',
        correct_answer: 'C',
        selected_answer: 'C',
        is_correct: true,
        explanation: 'aPTT is used to monitor heparin therapy.'
      },
      {
        id: 2,
        question_text: 'Which intervention is most important for a patient with a chest tube?',
        option_a: 'Encourage deep breathing and coughing',
        option_b: 'Keep the drainage system below the level of the chest',
        option_c: 'Clamp the tube when the patient is ambulating',
        option_d: 'Milk the chest tube every hour',
        correct_answer: 'B',
        selected_answer: 'B',
        is_correct: true,
        explanation: 'The drainage system must be kept below chest level.'
      },
      {
        id: 3,
        question_text: 'A patient with type 1 diabetes is experiencing nausea, vomiting, and abdominal pain.',
        option_a: 'Hypoglycemia',
        option_b: 'Hyperglycemia',
        option_c: 'Diabetic ketoacidosis',
        option_d: 'Hyperosmolar hyperglycemic state',
        correct_answer: 'C',
        selected_answer: 'A',
        is_correct: false,
        explanation: 'These symptoms are classic signs of DKA.'
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <Link href="/admin/attempts" className="text-primary hover:underline text-sm">
            ← Back to Attempts
          </Link>
          <h1 className="text-2xl font-bold text-dark mt-2">Attempt Details</h1>
        </div>

        {/* Attempt Summary */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Attempt Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted">Student</p>
              <p className="text-dark">{attempt.user_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Test Series</p>
              <p className="text-dark">{attempt.test_series_title}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Score</p>
              <p className="text-2xl font-bold text-primary">{attempt.score}/{attempt.total_questions}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Time Taken</p>
              <p className="text-dark">{Math.floor(attempt.time_taken / 60)}:{(attempt.time_taken % 60).toString().padStart(2, '0')}</p>
            </div>
          </div>
        </div>

        {/* Answer Details */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-dark mb-4">Answer Details</h2>
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div key={answer.id} className={`border rounded-lg p-4 ${answer.is_correct ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-dark">Question {index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded ${answer.is_correct ? 'bg-success text-white' : 'bg-error text-white'}`}>
                    {answer.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-sm text-dark mb-3">{answer.question_text}</p>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-muted">Selected:</span>
                    <span className="text-dark ml-2">{answer.selected_answer}. {answer[`option_${answer.selected_answer.toLowerCase()}`]}</span>
                  </div>
                  <div>
                    <span className="text-muted">Correct:</span>
                    <span className="text-dark ml-2">{answer.correct_answer}. {answer[`option_${answer.correct_answer.toLowerCase()}`]}</span>
                  </div>
                </div>
                <p className="text-sm text-muted italic">{answer.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}