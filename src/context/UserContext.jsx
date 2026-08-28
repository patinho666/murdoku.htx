import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext(null);

function makeUserId(name) {
  // Deterministic id from the name so the same name always maps to the same
  // "account" (per the spec: no password, just a name), regardless of
  // capitalization or spacing — "JOAO", "Joao", and "joao" all resolve to
  // the same account id.
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('murdoku_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('murdoku_user', JSON.stringify(user));
  }, [user]);

  async function login(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = makeUserId(trimmed);
    const ref = doc(db, 'users', id);

    // Keep whichever capitalization was used the very first time someone
    // logged into this account, so the displayed name doesn't flip-flop
    // depending on who typed it last (e.g. "JOAO" then later "joao").
    const existing = await getDoc(ref);
    const displayName = existing.exists() && existing.data().name ? existing.data().name : trimmed;

    await setDoc(ref, { name: displayName, lastLogin: serverTimestamp() }, { merge: true });
    setUser({ id, name: displayName });
  }

  function logout() {
    localStorage.removeItem('murdoku_user');
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
