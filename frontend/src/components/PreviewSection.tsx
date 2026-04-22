import { useState, useEffect } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { getStepDetail, chatWithDocument } from '@/lib/api';
import type { StepDetail } from '@/lib/api';
import Typewriter from './Typewriter';
import { cn } from '@/lib/utils';

interface PreviewSectionProps {
  stepId: number | null;
  documentId: number | null;
  onClose: () => void;
}

export default function PreviewSection({ stepId, documentId, onClose }: PreviewSectionProps) {
  const [step, setStep] = useState<StepDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (!stepId) {
      setStep(null);
      return;
    }

    const fetchStep = async () => {
      setLoading(true);
      try {
        const data = await getStepDetail(stepId);
        setStep(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStep();
  }, [stepId]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !documentId) return;

    const question = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);

    try {
      const response = await chatWithDocument(documentId, question, chatMessages);
      setChatMessages((prev) => [...prev, { role: 'assistant', content: response.answer }]);
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，暂时无法回答，请稍后再试。' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!stepId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-indigo-950 rounded-2xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-semibold text-cream-100">
              步骤 {step?.order} · {step?.title}
            </h3>
            <p className="text-sm text-slate-400">{step?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {documentId && (
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  chatOpen ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-cream-100 hover:bg-slate-800'
                )}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-cream-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className={cn('flex-1 overflow-y-auto p-6 md:p-8', chatOpen && 'hidden md:block md:w-2/3')}>
            {loading ? (
              <div className="space-y-4">
                <div className="h-6 bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-5/6" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
              </div>
            ) : step ? (
              <Typewriter
                key={step.id}
                content={step.content}
                speed={30}
              />
            ) : null}
          </div>

          {/* Chat Panel */}
          {chatOpen && documentId && (
            <div className="w-full md:w-1/3 border-l border-slate-800 flex flex-col bg-slate-900/50">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">有任何问题都可以问学长学姐</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                      msg.role === 'user'
                        ? 'ml-auto bg-amber-500/20 text-amber-100'
                        : 'bg-slate-800 text-slate-200'
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    思考中...
                  </div>
                )}
              </div>
              <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入问题..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cream-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-2 rounded-lg bg-amber-500 text-indigo-950 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
