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
  const progData = progSnap.exists() ? progSnap.data() : null;
  if (progData && (progData.status === 'in_progress' || progData.status === 'completed') && progData.sessionId) {
    const existing = progData.sessionId;
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
    usedClues: {},
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
  const data = snap.data();
  const puzzleId = data?.puzzleId;
  if (puzzleId) {
    // Don't downgrade a completed puzzle back to "in progress" just by
    // opening it again — mirror the session's actual status instead of
    // hardcoding one.
    await setDoc(progressRef(user.id, puzzleId), {
      sessionId,
      status: data.status === 'completed' ? 'completed' : 'in_progress',
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

  // Erase just one person's letter from a cell (leaves other people's
  // letters and any X in place).
  const erasePersonFromCell = useCallback((r, c, personName) => {
    if (!session) return;
    const key = cellKey(r, c);
    const current = session.marks?.[key]?.letters || [];
    if (!current.includes(personName)) return;
    patch({ [`marks.${key}.letters`]: current.filter((n) => n !== personName) });
  }, [session, patch]);

  const erasePersonFromCells = useCallback((cells, personName) => {
    if (!session) return;
    const fields = {};
    for (const [r, c] of cells) {
      const key = cellKey(r, c);
      const current = session.marks?.[key]?.letters || [];
      if (current.includes(personName)) {
        fields[`marks.${key}.letters`] = current.filter((n) => n !== personName);
      }
    }
    if (Object.keys(fields).length) patch(fields);
  }, [session, patch]);

  // Fixing a person: sets fixed[name], wipes their letter marks from the
  // ENTIRE board (their position is now certain, so stray candidate marks
  // elsewhere are no longer meaningful), and X's out every other cell in
  // their row and column.
  const fixPerson = useCallback((personName, r, c, gridSize) => {
    if (!session) return;
    const fields = { [`fixed.${personName}`]: [r, c] };
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (i === r && j === c) continue;
        const key = cellKey(i, j);
        const current = session.marks?.[key]?.letters || [];
        if (current.includes(personName)) {
          fields[`marks.${key}.letters`] = current.filter((n) => n !== personName);
        }
        if (i === r || j === c) {
          fields[`marks.${key}.x`] = true;
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

  const toggleUsedClue = useCallback((clueKey) => {
    if (!session) return;
    const current = !!session.usedClues?.[clueKey];
    patch({ [`usedClues.${clueKey}`]: !current });
  }, [session, patch]);

  // Locking: records WHICH people a cell is reserved for, as persistent
  // state (so it survives reload and syncs to other players), and clears
  // everyone else's candidate marks there. `names` is the locked set.
  const lockCells = useCallback((cells, names) => {
    if (!session || !names?.length) return;
    const fields = {};
    for (const [r, c] of cells) {
      const key = cellKey(r, c);
      fields[`marks.${key}.lock`] = [...names];
      const current = session.marks?.[key]?.letters || [];
      const kept = current.filter((n) => names.includes(n));
      if (kept.length !== current.length) fields[`marks.${key}.letters`] = kept;
    }
    patch(fields);
  }, [session, patch]);

  // Unlock. With `names`, removes only those people from each cell's lock
  // (dropping the lock entirely once it would be empty); without, clears
  // the whole lock.
  const unlockCells = useCallback((cells, names) => {
    if (!session) return;
    const fields = {};
    for (const [r, c] of cells) {
      const key = cellKey(r, c);
      const current = session.marks?.[key]?.lock;
      if (!current || !current.length) continue;
      if (!names || !names.length) {
        fields[`marks.${key}.lock`] = deleteField();
        continue;
      }
      const kept = current.filter((n) => !names.includes(n));
      fields[`marks.${key}.lock`] = kept.length ? kept : deleteField();
    }
    if (Object.keys(fields).length) patch(fields);
  }, [session, patch]);

  // Full-object overwrite of marks/fixed, used to restore a snapshot taken
  // before an undoable action. Overwrites rather than merges, since a
  // snapshot needs to fully replace the current state (including removing
  // keys added since the snapshot was taken).
  const restoreSnapshot = useCallback((marksSnapshot, fixedSnapshot) => {
    if (!sessionId) return;
    updateDoc(sessionRef(sessionId), {
      marks: marksSnapshot,
      fixed: fixedSnapshot,
      updatedAt: serverTimestamp(),
    });
  }, [sessionId]);

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
      usedClues: {},
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
    erasePersonFromCell, erasePersonFromCells,
    fixPerson, unfixPerson, submitAnswer, restartSession, toggleUsedClue,
    restoreSnapshot, lockCells, unlockCells,
  };
}
