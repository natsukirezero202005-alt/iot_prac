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

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Firestore request timed out after 10 seconds.'));
    }, 10000);
  });

  return Promise.race([savePromise, timeoutPromise]);
}
