import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from './config';

export async function saveAttempt(
  uid,
  { mode, score, total, percentage, correct, incorrect, unanswered }
) {
  return addDoc(
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
}

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
