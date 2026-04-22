import { useEffect, useState, useRef } from 'react';
import { FileText, Loader2 } from 'lucide-react';
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

    // Poll for status updates
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

  // Auto scroll to section when document uploaded
  useEffect(() => {
    if (documentId && sectionRef.current) {
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }, [documentId]);

  if (!documentId) return null;

  return (
    <section ref={sectionRef} id="transform" className="py-24 md:py-32 bg-indigo-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-wenkai text-3xl md:text-4xl font-bold text-cream-100 mb-4">
            转化成果
          </h2>
          <p className="text-slate-400 text-lg">
            你的笔记已经变成了结构化的学习教程
          </p>
        </div>

        {loading && !tutorial && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
            <p className="text-slate-400">正在加载...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {document && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left: Original Document */}
            <div className="relative">
              <div className="sticky top-24">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  原始文档
                </h3>
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-6 opacity-70">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-cream-100 font-medium">{document.original_name}</p>
                      <p className="text-xs text-slate-500">
                        {(document.file_size / 1024).toFixed(1)} KB · {document.file_type.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-3 rounded bg-slate-800"
                        style={{ width: `${60 + Math.random() * 40}%`, opacity: 0.3 + Math.random() * 0.4 }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-600 text-center">原始文档预览（已封存）</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Generated Steps */}
            <div>
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wider mb-4">
                生成教程 · {tutorial?.title || '处理中...'}
              </h3>
              {tutorial ? (
                <div className="space-y-4">
                  <p className="text-slate-300 mb-6">{tutorial.description}</p>
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
                    <div key={i} className="h-24 rounded-xl bg-slate-800/50 animate-pulse" />
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
