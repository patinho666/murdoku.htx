import { useState } from 'react';

export default function ShareId({ sessionId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/play/${sessionId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <button className="share-btn" onClick={copy}>
      {copied ? 'Copied!' : `Share (ID: ${sessionId})`}
    </button>
  );
}
