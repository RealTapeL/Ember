import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Upload, Loader2, Bot, User, FileText, X, Copy, RotateCcw, Square, ChevronDown, ChevronRight } from 'lucide-react';
import { marked } from 'marked';
import { cn } from '@/lib/utils';
import { chatWithDocument, uploadDocument, getTutorialByDocument, type DocumentItem } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
}

interface ChatAreaProps {
  selectedDoc: DocumentItem | null;
  onUploadComplete: () => void;
  onClearDoc: () => void;
}

export default function ChatArea({ selectedDoc, onUploadComplete, onClearDoc }: ChatAreaProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tutorialLoading, setTutorialLoading] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<Set<number>>(new Set());
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear messages when document changes
    setMessages([]);

    // Auto-load tutorial when document is selected
    if (selectedDoc && selectedDoc.status === 'completed') {
      setTutorialLoading(true);
      getTutorialByDocument(selectedDoc.id)
        .then((tutorial) => {
          const stepsText = tutorial.steps
            .map((s) => `**步骤 ${s.order}：${s.title}**\n${s.description}`)
            .join('\n\n');
          const content = `## ${tutorial.title}\n\n${tutorial.description}\n\n---\n\n### 你需要掌握的知识点\n\n${stepsText}\n\n---\n\n你可以针对以上任何步骤提问，我会帮你深入理解。`;
          setMessages([{ role: 'assistant', content: content }]);
        })
        .catch(() => {
          // Tutorial not found or not ready yet
        })
        .finally(() => setTutorialLoading(false));
    }
  }, [selectedDoc?.id]);

  const handleSend = async (overrideQuestion?: string) => {
    const question = (overrideQuestion ?? input).trim();
    if (!question || !selectedDoc) return;

    if (!overrideQuestion) {
      setInput('');
    }
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const response = await chatWithDocument(selectedDoc.id, question, messages, abort.signal);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.answer, reasoning: response.reasoning }]);
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        setMessages((prev) => [...prev, { role: 'assistant', content: '[已停止生成]' }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: '抱歉，暂时无法回答，请稍后再试。' }]);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleCopy = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      // ignore
    }
  };

  const handleRegenerate = (msgIdx: number) => {
    // Find the user message before this assistant message
    let userIdx = msgIdx - 1;
    while (userIdx >= 0 && messages[userIdx].role !== 'user') {
      userIdx--;
    }
    if (userIdx < 0) return;

    const question = messages[userIdx].content;
    // Remove this assistant message and all after it
    setMessages((prev) => prev.slice(0, msgIdx));
    handleSend(question);
  };

  const toggleReasoning = (idx: number) => {
    setExpandedReasoning((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      onUploadComplete();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `已上传文件：${file.name}，正在解析中...` },
      ]);
    } catch (err: any) {
      alert(err.response?.data?.detail || '上传失败');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-pixel-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b-4 border-pixel-border bg-pixel-card flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-pixel-primary" />
          <div>
            <h2 className="font-body text-base text-pixel-text">
              {selectedDoc ? selectedDoc.original_name : 'AI 助手'}
            </h2>
            {selectedDoc && (
              <p className="font-pixel text-[10px] text-pixel-muted">
                基于文档对话 · {selectedDoc.file_type.toUpperCase()}
              </p>
            )}
          </div>
        </div>
        {selectedDoc && (
          <button
            onClick={onClearDoc}
            className="p-1.5 border-2 border-pixel-border text-pixel-muted hover:text-pixel-danger hover:border-pixel-danger transition-all"
            title="清除当前文档"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !selectedDoc && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Bot className="w-16 h-16 text-pixel-border mb-4" />
            <h3 className="font-body text-2xl text-pixel-text mb-2">开始对话</h3>
            <p className="font-body text-pixel-muted mb-6 max-w-md">
              从左侧选择一个文档，或上传新文件，开始基于文档的 AI 对话
            </p>
            <label className="pixel-btn cursor-pointer">
              <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.md,.txt,.drawio" />
              <Upload className="w-4 h-4 inline mr-2" />
              上传文档开始
            </label>
          </div>
        )}

        {messages.length === 0 && selectedDoc && tutorialLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-10 h-10 text-pixel-primary animate-spin mb-3" />
            <p className="font-body text-pixel-muted">正在为你生成教程...</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div
              className={cn(
                'w-8 h-8 flex items-center justify-center flex-shrink-0 border-2',
                msg.role === 'user'
                  ? 'bg-pixel-primary text-pixel-bg border-pixel-primary'
                  : 'bg-pixel-secondary text-pixel-primary border-pixel-border'
              )}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className="max-w-[80%]">
              <div
                className={cn(
                  'px-4 py-3 font-body text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'border-2 border-pixel-primary bg-pixel-primary/10 text-pixel-text'
                    : 'border-2 border-pixel-border bg-pixel-card text-pixel-text prose prose-invert prose-sm max-w-none'
                )}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content, { async: false, breaks: true, gfm: true }) as string,
                    }}
                  />
                )}
              </div>

              {/* Reasoning dropdown */}
              {msg.role === 'assistant' && msg.reasoning && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleReasoning(i)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-pixel-muted hover:text-pixel-primary transition-colors"
                  >
                    {expandedReasoning.has(i) ? (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        收起思考过程
                      </>
                    ) : (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        查看思考过程
                      </>
                    )}
                  </button>
                  {expandedReasoning.has(i) && (
                    <div className="mt-1 px-3 py-2 border-2 border-pixel-border bg-pixel-bg/50 text-pixel-muted text-xs font-body whitespace-pre-wrap leading-relaxed">
                      {msg.reasoning}
                    </div>
                  )}
                </div>
              )}

              {/* Action bar for assistant messages */}
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => handleCopy(msg.content, i)}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] text-pixel-muted hover:text-pixel-primary transition-colors"
                    title="复制"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedIdx === i ? '已复制' : '复制'}
                  </button>
                  {i > 0 && messages[i - 1].role === 'user' && (
                    <button
                      onClick={() => handleRegenerate(i)}
                      className="flex items-center gap-1 px-2 py-1 text-[10px] text-pixel-muted hover:text-pixel-primary transition-colors"
                      title="重新回答"
                    >
                      <RotateCcw className="w-3 h-3" />
                      重新回答
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-pixel-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-body text-sm">思考中...</span>
            <button
              onClick={handleStop}
              className="flex items-center gap-1 px-2 py-1 border border-pixel-danger text-pixel-danger hover:bg-pixel-danger/10 transition-colors text-xs ml-2"
            >
              <Square className="w-3 h-3" />
              停止
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t-4 border-pixel-border bg-pixel-card flex-shrink-0">
        <div className="flex items-end gap-2">
          <label className="flex-shrink-0 p-3 border-2 border-pixel-border text-pixel-muted hover:text-pixel-primary hover:border-pixel-primary cursor-pointer transition-all">
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.md,.txt,.drawio" />
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder={selectedDoc ? '基于文档提问...' : '先选择或上传一个文档'}
            disabled={!selectedDoc || loading}
            className="pixel-input flex-1 resize-none min-h-[48px] max-h-[120px]"
            rows={1}
          />
          <button
            onClick={() => handleSend()}
            disabled={!selectedDoc || !input.trim() || loading}
            className="pixel-btn p-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="font-pixel text-[10px] text-pixel-muted mt-2 text-center">
          {selectedDoc ? 'Enter 发送 · Shift+Enter 换行' : '请先从左侧选择或上传一个文档'}
        </p>
      </div>
    </div>
  );
}
