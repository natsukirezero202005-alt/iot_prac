// Quiz helpers: mode setup, answer checking, scoring. No React, no Firebase.
import { questions } from '../data/questions';

export const MODES = {
  practice: { id: 'practice', label: 'Practice Mode' },
  hard: { id: 'hard', label: 'Hard Mode' },
};

export function normalizeMode(value) {
  return value === 'hard' ? 'hard' : 'practice';
}

// Practice Mode = MCQ only. Hard Mode = MCQ + fill-in-the-blank.
export function getQuestionsForMode(mode) {
  return mode === 'hard' ? questions : questions.filter((q) => q.type === 'mcq');
}

// Case-insensitive, trims, collapses repeated spaces.
export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isAnswered(question, value) {
  if (question.type === 'fill') return normalizeText(value) !== '';
  return Number.isInteger(value);
}

// Questions whose answer is missing from the data (answer: null) cannot be scored.
export function hasAnswerKey(question) {
  if (question.type === 'fill') return Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length > 0;
  return Number.isInteger(question.answer);
}

export function isCorrect(question, value) {
  if (!hasAnswerKey(question) || !isAnswered(question, value)) return false;
  if (question.type === 'fill') {
    const typed = normalizeText(value);
    return question.acceptedAnswers.some((a) => normalizeText(a) === typed);
  }
  return value === question.answer;
}

export function answerText(question, value) {
  if (!isAnswered(question, value)) return null;
  if (question.type === 'fill') return String(value).trim();
  return `${String.fromCharCode(65 + value)}. ${question.options[value]}`;
}

export function correctText(question) {
  if (!hasAnswerKey(question)) return null;
  if (question.type === 'fill') return question.acceptedAnswers.join('  /  ');
  return `${String.fromCharCode(65 + question.answer)}. ${question.options[question.answer]}`;
}

// status: correct | incorrect | unanswered | unscored (no answer key in the data)
export function evaluate(list, answers) {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let unscored = 0;

  const details = list.map((question) => {
    const value = answers[question.id];
    let status;
    if (!hasAnswerKey(question)) {
      status = 'unscored';
      unscored += 1;
    } else if (!isAnswered(question, value)) {
      status = 'unanswered';
      unanswered += 1;
    } else if (isCorrect(question, value)) {
      status = 'correct';
      correct += 1;
    } else {
      status = 'incorrect';
      incorrect += 1;
    }
    return { question, status, yourAnswer: answerText(question, value), correctAnswer: correctText(question) };
  });

  const total = list.length - unscored;
  const percentage = total === 0 ? 0 : Math.round((correct / total) * 1000) / 10;
  return { details, correct, incorrect, unanswered, unscored, total, score: correct, percentage };
}

// Handles Firestore Timestamp, Date, ISO string or millis.
export function formatDate(value) {
  if (!value) return '—';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
