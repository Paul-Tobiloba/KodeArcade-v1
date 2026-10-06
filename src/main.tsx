import React from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing';
import './styles.css';
import './course.css';
import './brand.css';
const App = React.lazy(() => import('./App'));
function Router() {
  const [hash, setHash] = React.useState(location.hash);
  React.useEffect(() => { const change = () => setHash(location.hash); addEventListener('hashchange', change); return () => removeEventListener('hashchange', change); }, []);
  const learning = hash.startsWith('#/learn') || hash === '#workspace';
  React.useEffect(() => { if (learning) window.scrollTo(0, 0); }, [learning]);
  return learning ? <React.Suspense fallback={<main className="route-loading" role="status">Opening your learning workspace…</main>}><App /></React.Suspense> : <Landing />;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Router /></React.StrictMode>);
