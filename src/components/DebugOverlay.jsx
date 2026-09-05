import { useEffect, useState } from 'react';

// An on-device error viewer. iOS Safari has no console, so a crash there is
// just a white screen with no way to find out why. This captures errors as
// early as possible and prints them ON the page, with a copy button, so a
// phone-only user can report what actually happened.
//
// Always active: a silent white screen is worse than an ugly error box.
export default function DebugOverlay() {
  const [errors, setErrors] = useState([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Transient connectivity errors are NORMAL on mobile — Firestore retries
    // and recovers on its own. Showing a big red panel for them turns a
    // non-event into an alarm, and worse, trains people to ignore the panel
    // so it is useless when something has genuinely broken. Only real
    // faults get through.
    const isExpectedNetworkNoise = (text) => /client is offline|Failed to get document because|network error|ERR_INTERNET_DISCONNECTED|Load failed|network request failed/i.test(String(text || ''));

    const add = (label, detail) => {
      if (isExpectedNetworkNoise(detail)) return;
      setErrors((e) => [...e, { label, detail, at: new Date().toISOString() }]);
    };

    const onError = (event) => {
      add('error', `${event.message}\n  at ${event.filename}:${event.lineno}:${event.colno}\n${event.error?.stack || ''}`);
    };
    const onRejection = (event) => {
      const r = event.reason;
      add('unhandled promise', r?.stack || r?.message || String(r));
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    // Anything the boot script caught before React mounted.
    if (window.__earlyErrors?.length) {
      for (const e of window.__earlyErrors) add('early', e);
      window.__earlyErrors = [];
    }

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (errors.length === 0) return null;

  const report = [
    `Murdoku error report`,
    `UA: ${navigator.userAgent}`,
    `Screen: ${window.innerWidth}x${window.innerHeight} dpr=${window.devicePixelRatio}`,
    `URL: ${window.location.href}`,
    '',
    ...errors.map((e, i) => `[${i + 1}] ${e.label} @ ${e.at}\n${e.detail}`),
  ].join('\n');

  return (
    <div className={`debug-overlay ${open ? '' : 'collapsed'}`}>
      <div className="debug-bar">
        <strong>{errors.length} error{errors.length > 1 ? 's' : ''}</strong>
        <span>
          <button onClick={() => navigator.clipboard?.writeText(report).catch(() => window.prompt('Copy:', report))}>Copy</button>
          <button onClick={() => setOpen((o) => !o)}>{open ? 'Hide' : 'Show'}</button>
        </span>
      </div>
      {open && <pre className="debug-body">{report}</pre>}
    </div>
  );
}
