import { useState } from 'react';
import LandingPage from './components/LandingPage';
import WorkspacePage from './components/WorkspacePage';
import BootAnimation from './components/BootAnimation';

function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [bootDone, setBootDone] = useState(false);

  return (
    <>
      {!bootDone && (
        <BootAnimation
          text="Xili_AI"
          duration={2800}
          onComplete={() => setBootDone(true)}
        />
      )}
      {bootDone && view === 'landing' && (
        <LandingPage onEnterWorkspace={() => setView('workspace')} />
      )}
      {bootDone && view === 'workspace' && (
        <WorkspacePage onBack={() => setView('landing')} />
      )}
    </>
  );
}

export default App;
