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
      <div className="absolute inset-0 bg-pixel-text/60 dark:bg-black/70" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-pixel-bg border-4 border-pixel-border shadow-[8px_8px_0px_0px_var(--pixel-shadow)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-4 border-pixel-border bg-pixel-secondary">
          <div>
            <h3 className="font-body text-lg text-pixel-text">
              步骤 {step?.order} · {step?.title}
            </h3>
            <p className="font-body text-sm text-pixel-muted">{step?.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {documentId && (
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className={cn(
                  'p-2 border-2 transition-all',
                  chatOpen ? 'border-pixel-primary bg-pixel-primary/20 text-pixel-primary' : 'border-pixel-border text-pixel-muted hover:text-pixel-text hover:border-pixel-muted'
                )}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 border-2 border-pixel-border text-pixel-muted hover:text-pixel-danger hover:border-pixel-danger transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <div className={cn('flex-1 overflow-y-auto p-5 md:p-6', chatOpen && 'hidden md:block md:w-2/3')}>
            {loading ? (
              <div className="space-y-3">
                <div className="h-6 bg-pixel-border animate-pulse w-3/4" />
                <div className="h-4 bg-pixel-border animate-pulse w-full" />
                <div className="h-4 bg-pixel-border animate-pulse w-5/6" />
                <div className="h-4 bg-pixel-border animate-pulse w-full" />
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
            <div className="w-full md:w-1/3 border-l-4 border-pixel-border flex flex-col bg-pixel-card">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-8 h-8 text-pixel-muted mx-auto mb-2" />
                    <p className="font-body text-sm text-pixel-muted">有任何问题都可以问学长学姐</p>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'max-w-[85%] px-3 py-2 text-sm font-body',
                      msg.role === 'user'
                        ? 'ml-auto border-2 border-pixel-primary bg-pixel-primary/10 text-pixel-primary'
                        : 'border-2 border-pixel-border bg-pixel-bg text-pixel-text'
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-pixel-muted text-sm font-body">
                    <div className="w-4 h-4 border-2 border-pixel-primary border-t-transparent animate-spin" />
                    思考中...
                  </div>
                )}
              </div>
              <div className="p-3 border-t-4 border-pixel-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入问题..."
                    className="pixel-input flex-1 text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="pixel-btn p-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
