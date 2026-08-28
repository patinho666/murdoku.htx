import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import PuzzleList from './pages/PuzzleList';
import PuzzleRoom from './pages/PuzzleRoom';
import FinishPage from './pages/FinishPage';
import Glossary from './pages/Glossary';

function Gate({ children }) {
  const { user } = useUser();
  if (!user) return <Login />;
  return children;
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Gate>
          <Routes>
            <Route path="/" element={<PuzzleList />} />
            <Route path="/play/:param" element={<PuzzleRoom />} />
            <Route path="/finish/:sessionId" element={<FinishPage />} />
            <Route path="/glossary" element={<Glossary />} />
          </Routes>
        </Gate>
      </BrowserRouter>
    </UserProvider>
  );
}
