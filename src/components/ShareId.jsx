import { useState } from 'react';

// Copies just the game ID (what the "Join" field on the puzzle list
// expects), not the full URL — pasting a whole URL into that field
// wouldn't resolve.
export default function ShareId({ sessionId }) {
  const [copied, setCopied] = useState(false);

  // The board now renders before the session handshake finishes, so this
  // can be called with no id yet.
  if (!sessionId) {
    return <button className="share-btn" disabled>ID: …</button>;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this game ID:', sessionId);
    }
  };

  return (
    <button className="share-btn" onClick={copy} title="Copy game ID">
      {copied ? 'Copied!' : `ID: ${sessionId}`}
    </button>
  );
}
