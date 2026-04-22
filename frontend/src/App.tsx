import { useState, useCallback } from 'react';
import HeroSection from './components/HeroSection';
import UploadSection from './components/UploadSection';
import TransformSection from './components/TransformSection';
import PreviewSection from './components/PreviewSection';
import HeritageCorridor from './components/HeritageCorridor';

function App() {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [activeStepId, setActiveStepId] = useState<number | null>(null);

  const handleUploadComplete = useCallback((id: number) => {
    setDocumentId(id);
  }, []);

  const handleStepSelect = useCallback((stepId: number) => {
    setActiveStepId(stepId);
  }, []);

  const handleClosePreview = useCallback(() => {
    setActiveStepId(null);
  }, []);

  return (
    <div className="min-h-screen bg-indigo-950">
      <HeroSection />
      <UploadSection onUploadComplete={handleUploadComplete} />
      
      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      <TransformSection
        documentId={documentId}
        onStepSelect={handleStepSelect}
        activeStepId={activeStepId}
      />

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
      </div>

      <HeritageCorridor />

      {/* Footer */}
      <footer className="py-12 bg-indigo-950 border-t border-slate-800/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-wenkai text-xl text-cream-100 mb-2">知识传承工坊</p>
          <p className="text-sm text-slate-500">
            每一次上传，都是一次温暖的隔空喊话
          </p>
        </div>
      </footer>

      <PreviewSection
        stepId={activeStepId}
        documentId={documentId}
        onClose={handleClosePreview}
      />
    </div>
  );
}

export default App;
