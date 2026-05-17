import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import ReaderPanel from './ReaderPanel';
import ThemeToggle from './ThemeToggle';
import type { DocumentItem } from '@/lib/api';

interface WorkspacePageProps {
  onBack: () => void;
}

export default function WorkspacePage({ onBack }: WorkspacePageProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [readerDoc, setReaderDoc] = useState<DocumentItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSelectDoc = useCallback((doc: DocumentItem | null) => {
    setSelectedDoc(doc);
  }, []);

  const handleOpenReader = useCallback((doc: DocumentItem) => {
    setReaderDoc(doc);
  }, []);

  const handleCloseReader = useCallback(() => {
    setReaderDoc(null);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-pixel-bg overflow-hidden">
      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-4 border-b-4 border-pixel-border bg-pixel-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="pixel-btn py-1.5 px-3 text-sm"
          >
            <ArrowLeft className="w-4 h-4 inline mr-1" />
            返回首页
          </button>
          <div className="h-6 w-0.5 bg-pixel-border" />
          <span className="font-body text-lg text-pixel-text">知识库工作台</span>
        </div>
        <ThemeToggle />
      </div>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          key={refreshKey}
          selectedDocId={selectedDoc?.id || null}
          onSelectDoc={handleSelectDoc}
          onUploadComplete={handleUploadComplete}
          onOpenReader={handleOpenReader}
        />
        <ChatArea
          selectedDoc={selectedDoc}
          onUploadComplete={handleUploadComplete}
          onClearDoc={() => setSelectedDoc(null)}
        />
        {readerDoc && (
          <ReaderPanel
            doc={readerDoc}
            onClose={handleCloseReader}
          />
        )}
      </div>
    </div>
  );
}
