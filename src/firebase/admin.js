import { collection, collectionGroup, getDocs } from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';
import { auth, db } from './config';

const millis = (value) =>
  value && typeof value.toMillis === 'function' ? value.toMillis() : 0;

// Admin-only. Firestore rules refuse these reads for everyone
// without the admin claim.
export async function fetchAdminOverview() {
  if (!auth.currentUser) {
    throw new Error('Not signed in');
  }

  // Force-refresh the Firebase ID token so newly assigned
  // custom claims such as admin: true are available.
  await getIdToken(auth.currentUser, true);

  const [usersSnap, attemptsSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collectionGroup(db, 'quizAttempts')),
  ]);

  const users = new Map();

  usersSnap.forEach((d) => {
    users.set(d.id, {
      uid: d.id,
      ...d.data(),
    });
  });

  const attempts = attemptsSnap.docs
    .map((d) => {
      const uid = d.ref.parent.parent.id;
      const owner = users.get(uid);

      return {
        id: d.id,
        uid,
        studentName: owner?.name || '',
        email: owner?.email || '',
        ...d.data(),
      };
    })
    .sort(
      (a, b) =>
        millis(b.completedAt) - millis(a.completedAt)
    );

  const students = [...users.values()]
    .map((user) => {
      const own = attempts.filter(
        (a) => a.uid === user.uid
      );

      const average = own.length
        ? Math.round(
            (own.reduce(
              (sum, a) => sum + a.percentage,
              0
            ) /
              own.length) *
              10
          ) / 10
        : 0;

      return {
        ...user,
        attempts: own.length,
        lastAttempt: own[0]?.completedAt ?? null,
        average,
      };
    })
    .sort(
      (a, b) =>
        millis(b.createdAt) - millis(a.createdAt)
    );

  return {
    students,
    attempts,
  };
}