import React from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './Landing';
import MarketingPages, { type MarketingPage } from './MarketingPages';
import LearningEntry from './LearningEntry';
import { isCourse } from './courses';
import LoadingScreen from './LoadingScreen';
import { accountRoute } from './account-api';
import './styles.css';
import './course.css';
import './brand.css';
import './learning-world.css';
const App = React.lazy(() => import('./App'));
const AccountPortal = React.lazy(() => import('./AccountPortal'));
const StudentActivity = React.lazy(() => import('./StudentCourses').then(module => ({ default: module.StudentActivity })));
function Router() {
  const [hash, setHash] = React.useState(location.hash);
  React.useEffect(() => { const change = () => setHash(location.hash); addEventListener('hashchange', change); return () => removeEventListener('hashchange', change); }, []);
  const learning = hash.startsWith('#/learn') || hash === '#workspace';
  const studentActivity = hash.startsWith('#/student-play/');
  const account = accountRoute(hash);
  const courseRoute = hash.split('/')[2];
  const courseSelected = isCourse(courseRoute) || courseRoute === 'computer';
  const route = hash.split('/')[1];
  const marketingPage: MarketingPage = route === 'courses' || route === 'how-it-works' || route === 'parents' ? route : 'home';
  React.useEffect(() => { window.scrollTo(0, 0); }, [learning, marketingPage, courseRoute, account]);
  return studentActivity ? <React.Suspense fallback={<LoadingScreen />}><StudentActivity key={courseRoute} course={courseRoute} /></React.Suspense> : account ? <React.Suspense fallback={<LoadingScreen />}><AccountPortal key={hash} route={account} /></React.Suspense> : learning ? !courseSelected ? <LearningEntry /> : <React.Suspense fallback={<LoadingScreen />}><App key={courseRoute} /></React.Suspense> : marketingPage === 'home' ? <Landing /> : <MarketingPages key={marketingPage} page={marketingPage} />;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><Router /></React.StrictMode>);
