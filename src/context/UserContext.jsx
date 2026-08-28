import { createContext, useContext, useEffect, useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const UserContext = createContext(null);

function makeUserId(name) {
  // Deterministic id from the name so the same name always maps to the same
  // "account" (per the spec: no password, just a name). Lowercased + slugged.
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
    await setDoc(
      doc(db, 'users', id),
      { name: trimmed, lastLogin: serverTimestamp() },
      { merge: true }
    );
    setUser({ id, name: trimmed });
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
