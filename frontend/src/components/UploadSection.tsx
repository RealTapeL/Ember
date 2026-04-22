import { useState, useCallback, useRef } from 'react';
import { FileText, Upload, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/lib/api';
import ProgressRing from './ProgressRing';

interface UploadSectionProps {
  onUploadComplete: (documentId: number) => void;
}

export default function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  }, []);

  const processFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['pdf', 'docx', 'doc', 'md', 'markdown', 'txt'];
    if (!ext || !allowed.includes(ext)) {
      setStatus('error');
      setErrorMsg('仅支持 PDF、Word、Markdown、TXT 格式');
      return;
    }

    setStatus('uploading');
    setUploadProgress(0);
    setErrorMsg('');

    try {
      const data = await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });

      setStatus('processing');
      onUploadComplete(data.id);

      // Simulate processing steps for UX
      const steps = ['提取文字', '理解结构', '生成步骤', '优化排版'];
      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, 1200));
        setUploadProgress(100 + (i + 1) * 5);
      }

      setStatus('done');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || '上传失败，请重试');
    }
  };

  return (
    <section id="upload" className="relative py-24 md:py-32 bg-indigo-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-wenkai text-3xl md:text-4xl font-bold text-cream-100 mb-4">
            开始传承
          </h2>
          <p className="text-slate-400 text-lg">
            拖拽你的文档到这里，让知识流动起来
          </p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => status === 'idle' && inputRef.current?.click()}
          className={cn(
            'relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden',
            'min-h-[280px] flex flex-col items-center justify-center',
            isDragging
              ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
              : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50',
            status === 'done' && 'border-emerald-500/50 bg-emerald-500/5',
            status === 'error' && 'border-red-500/50 bg-red-500/5'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.md,.txt"
            onChange={handleFileSelect}
          />

          {status === 'idle' && (
            <div className="text-center transition-transform duration-300">
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300',
                  isDragging
                    ? 'bg-amber-500/20 text-amber-400 scale-110'
                    : 'bg-slate-700/50 text-slate-400'
                )}
              >
                <Upload className="w-10 h-10" />
              </div>
              <p className="text-xl text-cream-100 mb-2">
                {isDragging ? '松开即可开始转化' : '拖拽你的文档到这里，或者点击选择文件'}
              </p>
              <p className="text-sm text-slate-500">
                支持 PDF、Word、Markdown、TXT 格式，最大 20MB
              </p>
            </div>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <div className="text-center">
              <ProgressRing progress={Math.min(uploadProgress, 100)} size={140} strokeWidth={10} className="mb-6" />
              <p className="text-lg text-cream-100 mb-2">
                {status === 'uploading' ? '正在上传...' : '正在炼金转化...'}
              </p>
              {status === 'processing' && (
                <div className="flex items-center justify-center gap-4 text-sm text-amber-400">
                  {['提取文字', '理解结构', '生成步骤', '优化排版'].map((step, i) => (
                    <span key={step} className="flex items-center gap-1">
                      <CheckCircle className={cn('w-4 h-4', i < Math.floor((uploadProgress - 100) / 5) ? 'opacity-100' : 'opacity-30')} />
                      {step}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {status === 'done' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <p className="text-xl text-cream-100 mb-2">转化完成</p>
              <p className="text-sm text-slate-400">向下滚动查看生成的教程</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10" />
              </div>
              <p className="text-xl text-cream-100 mb-2">出错了</p>
              <p className="text-sm text-red-400 mb-4">{errorMsg}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setStatus('idle');
                  setErrorMsg('');
                }}
                className="px-4 py-2 rounded-lg bg-slate-700 text-cream-100 hover:bg-slate-600 transition-colors"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
