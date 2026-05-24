import bcrypt from 'bcrypt';
import User from './models/User.js';
import Class from './models/Class.js';
import Quiz from './models/Quiz.js';
import QuizAttempt from './models/QuizAttempt.js';

const PASSWORD = 'demo123';

export async function seedDatabase() {
  const existing = await User.countDocuments();
  if (existing > 0) { console.log('DB has data, skipping seed'); return; }

  const hash = await bcrypt.hash(PASSWORD, 12);

  // Admin
  await User.create({ name: 'System Admin', email: 'admin@demo.com', passwordHash: hash, role: 'admin' });
  console.log('  Admin: admin@demo.com / demo123');

  // Teacher
  const teacher = await User.create({ name: 'Demo Teacher', email: 'teacher@demo.com', passwordHash: hash, role: 'teacher' });
  console.log('  Teacher: teacher@demo.com / demo123');

  // 3 classes
  const classes = await Class.insertMany([
    { name: 'Physics 10A',  subject: 'Physics',     teacherId: teacher._id, section: 'A' },
    { name: 'Chemistry 10B', subject: 'Chemistry',   teacherId: teacher._id, section: 'B' },
    { name: 'Mathematics 10C', subject: 'Mathematics', teacherId: teacher._id, section: 'C' },
  ]);
  console.log(`  Classes: ${classes.map(c => c.name).join(', ')}`);

  // 6 students (2 per class)
  const studentData = [
    { name: 'Alice',   email: 'alice@demo.com',   classIdx: 0 },
    { name: 'Bob',     email: 'bob@demo.com',     classIdx: 0 },
    { name: 'Charlie', email: 'charlie@demo.com', classIdx: 1 },
    { name: 'Diana',   email: 'diana@demo.com',   classIdx: 1 },
    { name: 'Eve',     email: 'eve@demo.com',     classIdx: 2 },
    { name: 'Frank',   email: 'frank@demo.com',   classIdx: 2 },
  ];

  const students = [];
  for (const sd of studentData) {
    const cls = classes[sd.classIdx];
    const user = await User.create({ name: sd.name, email: sd.email, passwordHash: hash, role: 'student', classId: cls._id });
    cls.studentIds.push(user._id);
    students.push(user);
  }
  for (const cls of classes) await cls.save();
  console.log(`  Students: ${students.map(s => `${s.name} (${s.email})`).join(', ')}`);

  // 3 sample quizzes (1 per class) with 5 questions each
  const quizTemplates = [
    { title: 'Physics Fundamentals',  subject: 'Physics',     difficulty: 'medium', timer: 15, questions: [
      { id: 1, type: 'mcq', question: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 'A', explanation: 'Force is measured in Newtons.', marks: 1 },
      { id: 2, type: 'mcq', question: 'Which law states F = ma?', options: ['First', 'Second', 'Third', 'Gravitation'], answer: 'B', explanation: 'Newton\'s second law.', marks: 1 },
      { id: 3, type: 'mcq', question: 'What is acceleration due to gravity?', options: ['9.8 m/s²', '10 m/s²', '8.9 m/s²', '9.0 m/s²'], answer: 'A', explanation: 'Standard g = 9.8 m/s²', marks: 1 },
      { id: 4, type: 'truefalse', question: 'Light travels faster than sound.', options: ['True', 'False'], answer: 'A', explanation: 'Light speed ≈ 3×10⁸ m/s, sound ≈ 343 m/s', marks: 1 },
      { id: 5, type: 'mcq', question: 'What is the unit of energy?', options: ['Newton', 'Joule', 'Watt', 'Coulomb'], answer: 'B', explanation: 'Energy is measured in Joules.', marks: 1 },
    ]},
    { title: 'Chemistry Basics', subject: 'Chemistry', difficulty: 'easy', timer: 10, questions: [
      { id: 1, type: 'mcq', question: 'What is the chemical symbol for water?', options: ['H₂O', 'CO₂', 'NaCl', 'O₂'], answer: 'A', explanation: 'Water is H₂O.', marks: 1 },
      { id: 2, type: 'mcq', question: 'What is the atomic number of Carbon?', options: ['4', '6', '8', '12'], answer: 'B', explanation: 'Carbon has atomic number 6.', marks: 1 },
      { id: 3, type: 'mcq', question: 'What pH is neutral?', options: ['0', '7', '10', '14'], answer: 'B', explanation: 'pH 7 is neutral.', marks: 1 },
      { id: 4, type: 'truefalse', question: 'Gold is a liquid at room temperature.', options: ['True', 'False'], answer: 'B', explanation: 'Gold is solid at room temp.', marks: 1 },
      { id: 5, type: 'mcq', question: 'Which gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'CO₂', 'Hydrogen'], answer: 'C', explanation: 'Plants absorb CO₂ for photosynthesis.', marks: 1 },
    ]},
    { title: 'Math Practice', subject: 'Mathematics', difficulty: 'hard', timer: 20, questions: [
      { id: 1, type: 'mcq', question: 'What is the value of π (approx)?', options: ['3.12', '3.14', '3.16', '3.18'], answer: 'B', explanation: 'π ≈ 3.14159', marks: 1 },
      { id: 2, type: 'mcq', question: 'What is the square root of 144?', options: ['10', '11', '12', '13'], answer: 'C', explanation: '√144 = 12', marks: 1 },
      { id: 3, type: 'mcq', question: 'What is 15% of 200?', options: ['25', '30', '35', '40'], answer: 'B', explanation: '15% of 200 = 30', marks: 1 },
      { id: 4, type: 'truefalse', question: 'A triangle has 4 sides.', options: ['True', 'False'], answer: 'B', explanation: 'A triangle has 3 sides.', marks: 1 },
      { id: 5, type: 'mcq', question: 'What is the area of a 3×4 rectangle?', options: ['7', '12', '14', '24'], answer: 'B', explanation: 'Area = 3 × 4 = 12', marks: 1 },
    ]},
  ];

  const quizzes = [];
  for (let i = 0; i < classes.length; i++) {
    const t = quizTemplates[i];
    const q = await Quiz.create({ ...t, classId: classes[i]._id, teacherId: teacher._id, questions: t.questions });
    quizzes.push(q);
  }
  console.log(`  Quizzes: ${quizzes.map(q => q.title).join(', ')}`);

  // Quiz attempts: each student answers their class quiz
  for (const student of students) {
    const cls = classes.find(c => c._id.equals(student.classId));
    const quiz = quizzes.find(q => q.classId.equals(cls._id));
    const answers = quiz.questions.map(q => ({
      questionId: q.id,
      answer: q.answer,
      isCorrect: true,
      marksObtained: q.marks,
    }));
    // give some students wrong answers for variance
    if (student.email === 'bob@demo.com') { answers[3].isCorrect = false; answers[3].marksObtained = 0; }
    if (student.email === 'frank@demo.com') { answers[1].isCorrect = false; answers[1].marksObtained = 0; answers[3].isCorrect = false; answers[3].marksObtained = 0; }

    const totalMarks = quiz.questions.reduce((s, q) => s + q.marks, 0);
    const obtained = answers.reduce((s, a) => s + a.marksObtained, 0);
    const percentage = Math.round((obtained / totalMarks) * 100);

    await QuizAttempt.create({ quizId: quiz._id, studentId: student._id, answers, score: obtained, totalMarks, percentage, timeTaken: 300 });
  }
  console.log('  Quiz attempts created');
  console.log('Seed complete!');
}
