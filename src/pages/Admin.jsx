import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { formatDate } from '../utils/quiz';
import { fetchAdminOverview } from '../firebase/admin'; // coming in the next phase

// Admin dashboard. Route is admin-only; the data itself is protected by Firestore Rules.
export default function Admin() {
  const [data, setData] = useState({ students: [], attempts: [] });
  const [status, setStatus] = useState('loading');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminOverview()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setStatus('ready');
        }
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, []);

  const attempts = useMemo(
    () => (selected ? data.attempts.filter((a) => a.uid === selected.uid) : data.attempts),
    [data.attempts, selected],
  );

  return (
    <div className="admin">
      <Header variant="plain" />
      <main className="admin__main">
        <h1>Admin dashboard</h1>

        {status === 'loading' && <p role="status">Loading students…</p>}
        {status === 'error' && <p className="form-error" role="alert">Could not load admin data. Check that your account has the admin claim.</p>}

        {status === 'ready' && (
          <>
            <p className="admin__summary">{data.students.length} students · {data.attempts.length} attempts</p>

            <h2>Students</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Student</th>
                    <th scope="col">Email</th>
                    <th scope="col">Account created</th>
                    <th scope="col">Attempts</th>
                    <th scope="col">Last attempt</th>
                    <th scope="col">Average score</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((s) => (
                    <tr key={s.uid} className={selected?.uid === s.uid ? 'is-selected' : ''}>
                      <th scope="row">{s.name || '—'}</th>
                      <td>{s.email}</td>
                      <td>{formatDate(s.createdAt)}</td>
                      <td>{s.attempts}</td>
                      <td>{formatDate(s.lastAttempt)}</td>
                      <td>{s.attempts ? `${s.average}%` : '—'}</td>
                      <td>
                        <button type="button" className="btn btn--secondary btn--small" onClick={() => setSelected(selected?.uid === s.uid ? null : s)}>
                          {selected?.uid === s.uid ? 'Show all' : 'View attempts'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>{selected ? `Attempts by ${selected.name || selected.email}` : 'All attempts'}</h2>
            {attempts.length === 0 ? (
              <p>No attempts yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Mode</th>
                      <th scope="col">Score</th>
                      <th scope="col">Percentage</th>
                      <th scope="col">Correct</th>
                      <th scope="col">Incorrect</th>
                      <th scope="col">Unanswered</th>
                      <th scope="col">Completed at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={`${a.uid}-${a.id}`}>
                        <th scope="row">{a.studentName || a.email}</th>
                        <td>{a.mode === 'hard' ? 'Hard' : 'Practice'}</td>
                        <td>{a.score} / {a.total}</td>
                        <td>{a.percentage}%</td>
                        <td>{a.correct}</td>
                        <td>{a.incorrect}</td>
                        <td>{a.unanswered}</td>
                        <td>{formatDate(a.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
