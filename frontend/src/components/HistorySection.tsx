import { useEffect, useState, useCallback } from 'react';
import { Clock, FileText, Trash2, BookOpen, Loader2, AlertCircle, Database } from 'lucide-react';
import { getDocuments, deleteDocument } from '@/lib/api';
import type { DocumentItem } from '@/lib/api';
import { cn } from '@/lib/utils';

interface HistorySectionProps {
  currentDocumentId: number | null;
  onSelectDocument: (id: number) => void;
}

export default function HistorySection({ currentDocumentId, onSelectDocument }: HistorySectionProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (e) {
      console.error('Failed to fetch documents:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 10000);
    return () => clearInterval(interval);
  }, [fetchDocuments]);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个文档及其生成的教程吗？')) return;

    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (currentDocumentId === id) {
        onSelectDocument(0);
      }
    } catch (e) {
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelect = (id: number) => {
    onSelectDocument(id);
    setTimeout(() => {
      document.getElementById('transform')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <BookOpen className="w-4 h-4 text-pixel-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-pixel-danger" />;
      case 'uploaded':
      case 'parsing':
      case 'parsed':
      case 'generating':
        return <Loader2 className="w-4 h-4 text-pixel-primary animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-pixel-muted" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'error': return '失败';
      case 'uploaded': return '已上传';
      case 'parsing': return '解析中';
      case 'parsed': return '已解析';
      case 'generating': return '生成中';
      default: return status;
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-pixel-bg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-pixel-primary animate-spin mr-2" />
            <span className="text-pixel-muted font-body">加载历史记录...</span>
          </div>
        </div>
      </section>
    );
  }

  if (documents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-pixel-bg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-pixel-primary" />
            <div>
              <h2 className="font-body text-2xl md:text-3xl text-pixel-text mb-1">
                传承记录
              </h2>
              <p className="text-pixel-muted text-sm font-body">你留下的知识足迹</p>
            </div>
          </div>
          <span className="font-pixel text-[10px] text-pixel-muted bg-pixel-secondary border-2 border-pixel-border px-3 py-1">
            共 {documents.length} 个
          </span>
        </div>

        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleSelect(doc.id)}
              className={cn(
                'group relative flex items-center gap-4 p-4 cursor-pointer transition-all duration-100',
                'pixel-border-thin bg-pixel-card',
                currentDocumentId === doc.id
                  ? 'border-pixel-primary shadow-[0_0_12px_rgba(0,217,255,0.15)]'
                  : 'hover:border-pixel-muted'
              )}
            >
              <div className="flex-shrink-0 w-10 h-10 border-2 border-pixel-border bg-pixel-bg flex items-center justify-center">
                <FileText className="w-5 h-5 text-pixel-muted" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-pixel-text font-body truncate">{doc.original_name}</p>
                  <span
                    className={cn(
                      'flex-shrink-0 inline-flex items-center gap-1 font-pixel text-[10px] px-2 py-0.5 border',
                      doc.status === 'completed'
                        ? 'border-pixel-success text-pixel-success bg-pixel-success/10'
                        : doc.status === 'error'
                          ? 'border-pixel-danger text-pixel-danger bg-pixel-danger/10'
                          : 'border-pixel-primary text-pixel-primary bg-pixel-primary/10'
                    )}
                  >
                    {getStatusIcon(doc.status)}
                    {getStatusLabel(doc.status)}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-pixel text-[10px] text-pixel-muted tracking-wider">
                  <span>{doc.file_type.toUpperCase()}</span>
                  <span className="text-pixel-border">|</span>
                  <span>{formatSize(doc.file_size)}</span>
                  <span className="text-pixel-border">|</span>
                  <span>{formatDate(doc.created_at)}</span>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(e, doc.id)}
                disabled={deletingId === doc.id}
                className="flex-shrink-0 p-2 border-2 border-transparent text-pixel-muted hover:text-pixel-danger hover:border-pixel-danger hover:bg-pixel-danger/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                {deletingId === doc.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
