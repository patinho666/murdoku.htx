import { useEffect, useState, useCallback, useRef } from 'react';
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot,
  serverTimestamp, arrayUnion, deleteField,
} from 'firebase/firestore';
import { db } from '../firebase';
import { cellKey } from '../utils/cellKey';
import { checkSolution } from '../utils/checkSolution';
import { customAlphabet } from './nanoidLite';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

function sessionRef(sessionId) {
  return doc(db, 'sessions', sessionId);
}
function progressRef(userId, puzzleId) {
  return doc(db, 'users', userId, 'progress', puzzleId);
}

// Creates a brand-new session, or resumes the caller's existing in-progress
// session for this puzzle if one exists and no explicit sessionId (from a
// share link) was given.
export async function startOrJoinSession(puzzle, user, sessionIdFromLink) {
  if (sessionIdFromLink) {
    const snap = await getDoc(sessionRef(sessionIdFromLink));
    if (snap.exists()) {
      await joinSession(sessionIdFromLink, user);
      return sessionIdFromLink;
    }
    // Link was stale/invalid — fall through and create a fresh one instead.
  }

  const progSnap = await getDoc(progressRef(user.id, puzzle.id));
  if (progSnap.exists() && progSnap.data().status === 'in_progress' && progSnap.data().sessionId) {
    const existing = progSnap.data().sessionId;
    const existingSessionSnap = await getDoc(sessionRef(existing));
    if (existingSessionSnap.exists()) {
      await joinSession(existing, user);
      return existing;
    }
  }

  const sessionId = nanoid();
  await setDoc(sessionRef(sessionId), {
    puzzleId: puzzle.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    players: { [user.id]: { name: user.name, connected: true, lastSeen: serverTimestamp() } },
    everPlayers: [user.id],
    marks: {},
    fixed: {},
    status: 'active',
  });
  await setDoc(progressRef(user.id, puzzle.id), {
    sessionId,
    status: 'in_progress',
    lastPlayed: serverTimestamp(),
  }, { merge: true });
  return sessionId;
}

async function joinSession(sessionId, user) {
  await updateDoc(sessionRef(sessionId), {
    [`players.${user.id}`]: { name: user.name, connected: true, lastSeen: serverTimestamp() },
    everPlayers: arrayUnion(user.id),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(sessionRef(sessionId));
  const puzzleId = snap.data()?.puzzleId;
  if (puzzleId) {
    await setDoc(progressRef(user.id, puzzleId), {
      sessionId,
      status: 'in_progress',
      lastPlayed: serverTimestamp(),
    }, { merge: true });
  }
}

export function useSession(sessionId, user) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!sessionId) return;
    const unsub = onSnapshot(sessionRef(sessionId), (snap) => {
      setSession(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  // Presence: mark connected on mount, disconnected on unmount.
  useEffect(() => {
    if (!sessionId || !user) return;
    mountedRef.current = true;
    updateDoc(sessionRef(sessionId), {
      [`players.${user.id}.connected`]: true,
      [`players.${user.id}.lastSeen`]: serverTimestamp(),
    }).catch(() => {});

    const markGone = () => {
      updateDoc(sessionRef(sessionId), {
        [`players.${user.id}.connected`]: false,
      }).catch(() => {});
    };
    window.addEventListener('beforeunload', markGone);
    return () => {
      mountedRef.current = false;
      markGone();
      window.removeEventListener('beforeunload', markGone);
    };
  }, [sessionId, user]);

  const patch = useCallback((fields) => {
    if (!sessionId) return;
    updateDoc(sessionRef(sessionId), { ...fields, updatedAt: serverTimestamp() });
  }, [sessionId]);

  const toggleLetter = useCallback((r, c, personName) => {
    if (!session) return;
    const key = cellKey(r, c);
    const current = session.marks?.[key]?.letters || [];
    const has = current.includes(personName);
    const nextLetters = has ? current.filter((n) => n !== personName) : [...current, personName];
    patch({
      [`marks.${key}.letters`]: nextLetters,
      [`marks.${key}.x`]: false,
    });
  }, [session, patch]);

  const setLetterForCells = useCallback((cells, personName, add) => {
    if (!session) return;
    const fields = {};
    for (const [r, c] of cells) {
      const key = cellKey(r, c);
      const current = session.marks?.[key]?.letters || [];
      const has = current.includes(personName);
      let next = current;
      if (add && !has) next = [...current, personName];
      if (!add && has) next = current.filter((n) => n !== personName);
      fields[`marks.${key}.letters`] = next;
      fields[`marks.${key}.x`] = false;
    }
    patch(fields);
  }, [session, patch]);

  const toggleX = useCallback((r, c) => {
    if (!session) return;
    const key = cellKey(r, c);
    const currentX = !!session.marks?.[key]?.x;
    patch({
      [`marks.${key}.x`]: !currentX,
      [`marks.${key}.letters`]: [],
    });
  }, [session, patch]);

  const eraseCell = useCallback((r, c) => {
    const key = cellKey(r, c);
    patch({ [`marks.${key}`]: deleteField() });
  }, [patch]);

  const eraseCells = useCallback((cells) => {
    const fields = {};
    for (const [r, c] of cells) fields[`marks.${cellKey(r, c)}`] = deleteField();
    patch(fields);
  }, [patch]);

  // Fixing a person: sets fixed[name], removes their letter marks elsewhere,
  // and X's out every other cell in that row and column.
  const fixPerson = useCallback((personName, r, c, gridSize) => {
    if (!session) return;
    const fields = { [`fixed.${personName}`]: [r, c] };
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (i === r && j === c) continue;
        if (i === r || j === c) {
          fields[`marks.${cellKey(i, j)}.x`] = true;
          const key = cellKey(i, j);
          const current = session.marks?.[key]?.letters || [];
          if (current.length) fields[`marks.${key}.letters`] = current.filter((n) => n !== personName);
        }
      }
    }
    fields[`marks.${cellKey(r, c)}.x`] = false;
    fields[`marks.${cellKey(r, c)}.letters`] = [personName];
    patch(fields);
  }, [session, patch]);

  const unfixPerson = useCallback((personName) => {
    patch({ [`fixed.${personName}`]: deleteField() });
  }, [patch]);

  // Submits the answer. On success, marks the puzzle completed for every
  // currently-connected player only (per spec: absent players' own
  // databases are left untouched).
  const submitAnswer = useCallback(async (puzzle) => {
    if (!session) return false;
    const correct = checkSolution(puzzle, session.fixed || {});
    if (!correct) return false;
    await updateDoc(sessionRef(sessionId), {
      status: 'completed',
      completedAt: serverTimestamp(),
    });
    const connectedIds = Object.entries(session.players || {})
      .filter(([, p]) => p.connected)
      .map(([id]) => id);
    await Promise.all(connectedIds.map((id) =>
      setDoc(progressRef(id, puzzle.id), {
        sessionId,
        status: 'completed',
        completedAt: serverTimestamp(),
      }, { merge: true })
    ));
    return true;
  }, [session, sessionId]);

  // Wipes all marks/fixed data and reopens the puzzle for everyone who ever
  // played this session.
  const restartSession = useCallback(async (puzzle) => {
    if (!session) return;
    await updateDoc(sessionRef(sessionId), {
      marks: {},
      fixed: {},
      status: 'active',
      completedAt: deleteField(),
    });
    const everIds = session.everPlayers || [];
    await Promise.all(everIds.map((id) =>
      setDoc(progressRef(id, puzzle.id), {
        sessionId,
        status: 'in_progress',
        lastPlayed: serverTimestamp(),
        completedAt: deleteField(),
      }, { merge: true })
    ));
  }, [session, sessionId]);

  return {
    session, loading,
    toggleLetter, setLetterForCells, toggleX, eraseCell, eraseCells,
    fixPerson, unfixPerson, submitAnswer, restartSession,
  };
}
