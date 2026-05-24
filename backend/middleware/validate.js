import { body, validationResult } from 'express-validator';

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars'),
  body('role').isIn(['teacher', 'student', 'admin']).withMessage('Invalid role'),
  handleErrors,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleErrors,
];

export const classValidation = [
  body('name').trim().notEmpty().withMessage('Class name required'),
  handleErrors,
];

export const quizValidation = [
  body('title').trim().notEmpty().withMessage('Quiz title required'),
  body('classId').isMongoId().withMessage('Valid class ID required'),
  body('questions').isArray({ min: 1 }).withMessage('At least 1 question required'),
  handleErrors,
];
