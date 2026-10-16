import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';

// Saves one finished attempt at users/{uid}/quizAttempts/{autoId}.
export async function saveAttempt(
  uid,
  { mode, score, total, percentage, correct, incorrect, unanswered }
) {
  const savePromise = addDoc(
    collection(db, 'users', uid, 'quizAttempts'),
    {
      mode,
      score,
      total,
      percentage,
      correct,
      incorrect,
      unanswered,
      completedAt: serverTimestamp(),
    }
  );

  // Prevent the quiz from being stuck forever if Firebase does not respond.
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Firestore save timed out. Please check your internet connection.'));
    }, 2000);
  });

  return Promise.race([savePromise, timeoutPromise]);
}

// A student's own history, newest first.
export async function getMyAttempts(uid) {
  const q = query(
    collection(db, 'users', uid, 'quizAttempts'),
    orderBy('completedAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
