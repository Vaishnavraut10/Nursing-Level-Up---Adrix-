'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/layouts/AdminLayout';

export default function QuestionsManagementPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    explanation: ''
  });

  useEffect(() => {
    // Mock questions
    setQuestions([
      { id: 1, question_text: 'A patient is receiving heparin therapy...', option_a: 'PT', option_b: 'INR', option_c: 'aPTT', option_d: 'Platelet count', correct_answer: 'C', explanation: 'aPTT is used to monitor heparin therapy.', order_index: 1 },
      { id: 2, question_text: 'Which intervention is most important...', option_a: 'Deep breathing', option_b: 'Keep drainage below chest', option_c: 'Clamp tube', option_d: 'Milk tube', correct_answer: 'B', explanation: 'Drainage must be below chest level.', order_index: 2 },
      { id: 3, question_text: 'A patient with type 1 diabetes...', option_a: 'Hypoglycemia', option_b: 'Hyperglycemia', option_c: 'DKA', option_d: 'HHS', correct_answer: 'C', explanation: 'These symptoms indicate DKA.', order_index: 3 },
      { id: 4, question_text: 'Normal adult respiratory rate...', option_a: '8-10/min', option_b: '12-20/min', option_c: '22-30/min', option_d: '30-40/min', correct_answer: 'B', explanation: 'Normal is 12-20 breaths per minute.', order_index: 4 },
      { id: 5, question_text: 'Heparin subcutaneous injection site...', option_a: 'Deltoid', option_b: 'Vastus lateralis', option_c: 'Abdominal', option_d: 'Dorsogluteal', correct_answer: 'C', explanation: 'Abdominal subcutaneous tissue reduces bruising.', order_index: 5 },
    ]);
    setLoading(false);
  }, []);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    // API call to add question
    console.log('Adding question:', newQuestion);
    setShowAddForm(false);
    setNewQuestion({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: ''
    });
  };

  const handleDeleteQuestion = (id: number) => {
    // API call to delete question
    console.log('Deleting question:', id);
    setQuestions(questions.filter(q => q.id !== id));
  };

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
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/test-series" className="text-primary hover:underline text-sm">
              ← Back to Test Series
            </Link>
            <h1 className="text-2xl font-bold text-dark mt-2">Manage Questions</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Question</label>
                <textarea
                  value={newQuestion.question_text}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Option A</label>
                  <input
                    type="text"
                    value={newQuestion.option_a}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Option B</label>
                  <input
                    type="text"
                    value={newQuestion.option_b}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Option C</label>
                  <input
                    type="text"
                    value={newQuestion.option_c}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Option D</label>
                  <input
                    type="text"
                    value={newQuestion.option_d}
                    onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Correct Answer</label>
                <select
                  value={newQuestion.correct_answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Explanation (optional)</label>
                <textarea
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Add Question
              </button>
            </form>
          </div>
        )}

        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-primary/5">
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">#</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Question</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Correct</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-dark">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={q.id} className="border-b border-border hover:bg-primary/5">
                  <td className="py-4 px-6 text-sm text-muted">{index + 1}</td>
                  <td className="py-4 px-6 text-sm text-dark">{q.question_text.substring(0, 60)}...</td>
                  <td className="py-4 px-6 text-sm text-dark font-semibold">{q.correct_answer}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-error hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}