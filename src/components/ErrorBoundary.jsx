import { Component } from 'react';

// Without this, any render-time exception unmounts the whole React tree and
// leaves a blank white page — which is exactly what "it never loads" looks
// like from the outside.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const text = [
      'Murdoku render crash',
      `UA: ${navigator.userAgent}`,
      String(this.state.error?.stack || this.state.error),
      this.state.info?.componentStack || '',
    ].join('\n');
    return (
      <div className="crash-screen">
        <h2>Something broke while drawing this screen.</h2>
        <p>Copy this and send it over — it says exactly what failed.</p>
        <pre>{text}</pre>
        <div className="crash-actions">
          <button onClick={() => navigator.clipboard?.writeText(text).catch(() => window.prompt('Copy:', text))}>Copy report</button>
          <button onClick={() => { localStorage.removeItem('murdoku_user'); window.location.href = '/'; }}>Reset & reload</button>
        </div>
      </div>
    );
  }
}
