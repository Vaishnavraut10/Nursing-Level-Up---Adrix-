-- Seed Data for Nursing Level Up Admin System

-- Admin User
INSERT INTO users (email, name, role) VALUES
('admin@nursinglevelup.com', 'Admin User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Student Users
INSERT INTO users (email, name, role) VALUES
('student1@example.com', 'Rahul Sharma', 'STUDENT'),
('student2@example.com', 'Priya Patel', 'STUDENT'),
('student3@example.com', 'Amit Kumar', 'STUDENT'),
('student4@example.com', 'Sneha Singh', 'STUDENT'),
('student5@example.com', 'Vikram Joshi', 'STUDENT')
ON CONFLICT (email) DO NOTHING;

-- Test Series (matching the frontend mock data)
INSERT INTO test_series (title, description, duration, is_free, price, status, question_count) VALUES
('Test Series 01', 'Foundation nursing concepts covering basic principles and patient care fundamentals.', 45, true, 0, 'PUBLISHED', 50),
('Test Series 02', 'Intermediate nursing practice focusing on medical-surgical and pharmacology concepts.', 45, true, 0, 'PUBLISHED', 50),
('Test Series 03', 'Advanced nursing concepts including specialized care and complex patient scenarios.', 45, false, 199, 'PUBLISHED', 50),
('Test Series 04', 'Comprehensive nursing practice covering all major nursing specialties and advanced concepts.', 45, false, 199, 'PUBLISHED', 50),
('Test Series 05', 'Final preparation test series simulating actual nursing competitive exam patterns.', 45, false, 199, 'DRAFT', 50)
ON CONFLICT DO NOTHING;

-- Sample Questions for Test Series 01
INSERT INTO questions (test_series_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index) VALUES
(1, 'A patient is receiving heparin therapy for deep vein thrombosis. Which laboratory test should the nurse monitor to assess the effectiveness of heparin therapy?', 'Prothrombin time (PT)', 'International normalized ratio (INR)', 'Activated partial thromboplastin time (aPTT)', 'Platelet count', 'C', 'aPTT is used to monitor heparin therapy. The therapeutic range for aPTT is typically 1.5 to 2.5 times the control value. PT and INR are used to monitor warfarin therapy.', 1),
(1, 'Which intervention is most important for a patient with a chest tube following thoracic surgery?', 'Encourage deep breathing and coughing', 'Keep the drainage system below the level of the chest', 'Clamp the tube when the patient is ambulating', 'Milk the chest tube every hour', 'B', 'The drainage system must be kept below the level of the chest to prevent backflow of fluid into the pleural space. This is critical to prevent complications such as pneumothorax or infection.', 2),
(1, 'A patient with type 1 diabetes mellitus is experiencing nausea, vomiting, and abdominal pain. The nurse should first assess for:', 'Hypoglycemia', 'Hyperglycemia', 'Diabetic ketoacidosis', 'Hyperosmolar hyperglycemic state', 'C', 'These symptoms are classic signs of diabetic ketoacidosis (DKA). The nurse should assess for Kussmaul respirations, fruity breath odor, and dehydration which are characteristic of DKA.', 3),
(1, 'Which of the following is the normal adult respiratory rate?', '8–10/min', '12–20/min', '22–30/min', '30–40/min', 'B', 'The normal respiratory rate for adults is 12-20 breaths per minute. Rates outside this range may indicate respiratory distress or other medical conditions requiring assessment.', 4),
(1, 'A nurse is preparing to administer a subcutaneous injection. Which site is most appropriate for administering heparin?', 'Deltoid muscle', 'Vastus lateralis', 'Abdominal subcutaneous tissue', 'Dorsogluteal muscle', 'C', 'Heparin should be administered in the abdominal subcutaneous tissue to reduce the risk of bruising and hematoma. This site provides adequate absorption with minimal discomfort.', 5);

-- Sample Purchases
INSERT INTO purchases (user_id, test_series_id, amount, provider, payment_id, order_id, status) VALUES
(2, 3, 199, 'MOCK', 'pay_mock_123', 'order_mock_123', 'SUCCESS'),
(3, 3, 199, 'MOCK', 'pay_mock_124', 'order_mock_124', 'SUCCESS'),
(4, 4, 199, 'MOCK', 'pay_mock_125', 'order_mock_125', 'SUCCESS');

-- Sample Attempts
INSERT INTO attempts (user_id, test_series_id, started_at, submitted_at, score, total_questions, correct_answers, incorrect_answers, unanswered, time_taken, status) VALUES
(2, 1, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', 42, 50, 42, 6, 2, 5400, 'COMPLETED'),
(2, 2, NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 38, 50, 38, 8, 4, 2472, 'COMPLETED'),
(3, 1, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days 23 hours', 45, 50, 45, 3, 2, 2145, 'COMPLETED'),
(4, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days 23 hours', 40, 50, 40, 7, 3, 2700, 'COMPLETED');

-- Sample User Answers
INSERT INTO user_answers (attempt_id, question_id, selected_answer, is_correct) VALUES
(1, 1, 'C', true),
(1, 2, 'B', true),
(1, 3, 'C', true),
(1, 4, 'B', true),
(1, 5, 'C', true);
