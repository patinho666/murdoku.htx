import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Returns { [puzzleId]: { status, sessionId, ... } } for the given user,
// updating live if the user finishes a puzzle in another tab/device.
export function usePuzzleProgress(userId) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!userId) return;
    const unsub = onSnapshot(collection(db, 'users', userId, 'progress'), (snap) => {
      const next = {};
      snap.forEach((d) => { next[d.id] = d.data(); });
      setProgress(next);
    });
    return () => unsub();
  }, [userId]);

  return progress;
}
