import { addDoc, collection, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// Saves one finished attempt at users/{uid}/quizAttempts/{autoId}.
// Only the fields below are stored (the Firestore rules reject anything else).
export function saveAttempt(uid, { mode, score, total, percentage, correct, incorrect, unanswered }) {
  return addDoc(collection(db, 'users', uid, 'quizAttempts'), {
    mode,
    score,
    total,
    percentage,
    correct,
    incorrect,
    unanswered,
    completedAt: serverTimestamp(),
  });
}

// A student's own history, newest first (for a future profile/dashboard page).
export async function getMyAttempts(uid) {
  const q = query(collection(db, 'users', uid, 'quizAttempts'), orderBy('completedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
