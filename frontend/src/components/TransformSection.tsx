import { useEffect, useState, useRef } from 'react';
import { FileText, Loader2, Cpu } from 'lucide-react';
import { getDocument, getTutorialByDocument } from '@/lib/api';
import type { DocumentItem, TutorialData } from '@/lib/api';
import StepCard from './StepCard';

interface TransformSectionProps {
  documentId: number | null;
  onStepSelect: (stepId: number) => void;
  activeStepId: number | null;
}

export default function TransformSection({ documentId, onStepSelect, activeStepId }: TransformSectionProps) {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [tutorial, setTutorial] = useState<TutorialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!documentId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const doc = await getDocument(documentId);
        setDocument(doc);

        if (doc.status === 'completed' || doc.status === 'generating') {
          try {
            const tut = await getTutorialByDocument(documentId);
            setTutorial(tut);
            setError('');
          } catch (e: any) {
            if (e.response?.status !== 404) {
              setError(e.response?.data?.detail || '获取教程失败');
            }
          }
        }
      } catch (e: any) {
        setError(e.response?.data?.detail || '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    intervalRef.current = setInterval(async () => {
      try {
        const doc = await getDocument(documentId);
        setDocument(doc);
        if (doc.status === 'completed') {
          const tut = await getTutorialByDocument(documentId);
          setTutorial(tut);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else if (doc.status === 'error') {
          setError(doc.error_message || '处理失败');
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // ignore polling errors
      }
    }, 2000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [documentId]);

  useEffect(() => {
    if (documentId && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [documentId]);

  if (!documentId) return null;

  return (
    <section ref={sectionRef} id="transform" className="py-20 md:py-28 bg-pixel-bg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pixel-secondary border-2 border-pixel-border mb-4">
            <Cpu className="w-4 h-4 text-pixel-primary" />
            <span className="font-pixel text-[10px] text-pixel-primary tracking-widest">RESULT</span>
          </div>
          <h2 className="font-body text-2xl md:text-3xl text-pixel-text mb-3">
            转化成果
          </h2>
          <p className="text-pixel-muted font-body">
            你的笔记已经变成了结构化的学习教程
          </p>
        </div>

        {loading && !tutorial && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-pixel-primary animate-spin mb-4" />
            <p className="text-pixel-muted font-body">正在加载...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 pixel-border border-pixel-danger bg-pixel-danger/5">
            <p className="font-body text-pixel-danger">{error}</p>
          </div>
        )}

        {document && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left: Original Document */}
            <div className="relative">
              <div className="sticky top-24">
                <h3 className="font-pixel text-[10px] text-pixel-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  原始文档
                </h3>
                <div className="pixel-border bg-pixel-card p-5 opacity-70">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 border-2 border-pixel-border bg-pixel-bg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-pixel-muted" />
                    </div>
                    <div>
                      <p className="text-pixel-text font-body">{document.original_name}</p>
                      <p className="font-pixel text-[10px] text-pixel-muted">
                        {(document.file_size / 1024).toFixed(1)} KB · {document.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 bg-pixel-border"
                        style={{ width: `${60 + Math.random() * 40}%`, opacity: 0.3 + Math.random() * 0.4 }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t-2 border-pixel-border">
                    <p className="font-pixel text-[10px] text-pixel-muted text-center tracking-wider">原始文档预览（已封存）</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Generated Steps */}
            <div>
              <h3 className="font-pixel text-[10px] text-pixel-primary uppercase tracking-widest mb-4">
                生成教程 · {tutorial?.title || '处理中...'}
              </h3>
              {tutorial ? (
                <div className="space-y-4">
                  <p className="text-pixel-muted font-body mb-6">{tutorial.description}</p>
                  {tutorial.steps.map((step) => (
                    <StepCard
                      key={step.id}
                      order={step.order}
                      title={step.title}
                      description={step.description}
                      isActive={activeStepId === step.id}
                      onClick={() => onStepSelect(step.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-24 pixel-border bg-pixel-card animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
