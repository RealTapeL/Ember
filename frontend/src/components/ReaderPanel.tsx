import { useState, useEffect } from 'react';
import { X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { getDocumentContent, getDocumentFileUrl, type DocumentItem } from '@/lib/api';

interface ReaderPanelProps {
  doc: DocumentItem | null;
  onClose: () => void;
}

marked.setOptions({ breaks: true, gfm: true });

export default function ReaderPanel({ doc, onClose }: ReaderPanelProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!doc) {
      setContent('');
      setError('');
      return;
    }

    if (doc.file_type === 'pdf' || doc.file_type === 'drawio') {
      // These are rendered via iframe, no need to fetch content
      setContent('');
      setError('');
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDocumentContent(doc.id);
        setContent(data.content);
      } catch {
        setError('无法读取文档内容');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [doc]);

  if (!doc) return null;

  const fileUrl = getDocumentFileUrl(doc.id);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 text-pixel-primary animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-pixel-danger">
          <AlertCircle className="w-8 h-8 mb-2" />
          <p className="font-body">{error}</p>
        </div>
      );
    }

    switch (doc.file_type) {
      case 'pdf':
        return (
          <iframe
            src={fileUrl}
            className="w-full h-full border-none"
            title={doc.original_name}
          />
        );

      case 'drawio':
        return (
          <iframe
            src={`https://viewer.diagrams.net/?highlight=0000ff&nav=1&title=${encodeURIComponent(doc.original_name)}#U${encodeURIComponent(fileUrl)}`}
            className="w-full h-full border-none"
            title={doc.original_name}
          />
        );

      case 'md':
      case 'markdown':
        return (
          <div
            className="prose prose-invert max-w-none p-4 font-body text-pixel-text"
            dangerouslySetInnerHTML={{ __html: marked.parse(content, { async: false }) as string }}
          />
        );

      case 'docx':
      case 'doc':
      case 'txt':
      default:
        return (
          <div className="p-4 font-body text-sm text-pixel-text whitespace-pre-wrap leading-relaxed">
            {content || '暂无内容，文档可能还在解析中...'}
          </div>
        );
    }
  };

  return (
    <div className="w-96 flex-shrink-0 h-full flex flex-col border-l-4 border-pixel-border bg-pixel-card animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-4 border-pixel-border bg-pixel-secondary">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-pixel-primary flex-shrink-0" />
          <span className="font-body text-sm text-pixel-text truncate">{doc.original_name}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 border-2 border-pixel-border text-pixel-muted hover:text-pixel-danger hover:border-pixel-danger transition-all flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
