import { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Login() {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await login(name);
    setBusy(false);
  };

  return (
    <div className="login-screen">
      <h1>🔎 Murdoku</h1>
      <p>Enter your name to play.</p>
      <form onSubmit={submit}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit" disabled={busy || !name.trim()}>
          {busy ? 'Entering…' : 'Enter'}
        </button>
      </form>
    </div>
  );
}
