import { useState, useCallback, useRef } from 'react';
import { FileText, Upload, CheckCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/lib/api';

interface UploadSectionProps {
  onUploadComplete: (documentId: number) => void;
}

const PROCESSING_STEPS = ['提取文字', '理解结构', '生成步骤', '优化排版'];

export default function UploadSection({ onUploadComplete }: UploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearStepTimer = () => {
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

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

    clearStepTimer();
    setStatus('uploading');
    setUploadProgress(0);
    setErrorMsg('');
    setCurrentStep(0);

    try {
      const data = await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });

      setStatus('processing');
      onUploadComplete(data.id);

      let step = 0;
      stepTimerRef.current = setInterval(() => {
        step++;
        setCurrentStep(step);
        if (step >= PROCESSING_STEPS.length) {
          clearStepTimer();
          setStatus('done');
        }
      }, 1500);
    } catch (err: any) {
      clearStepTimer();
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || '上传失败，请重试');
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearStepTimer();
    setStatus('idle');
    setErrorMsg('');
    setUploadProgress(0);
    setCurrentStep(0);
  };

  return (
    <section id="upload" className="relative py-20 md:py-28 bg-pixel-bg">
      <div className="max-w-3xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pixel-secondary border-2 border-pixel-border mb-4">
            <Zap className="w-4 h-4 text-pixel-primary" />
            <span className="font-pixel text-[10px] text-pixel-primary tracking-widest">UPLOAD</span>
          </div>
          <h2 className="font-body text-2xl md:text-3xl text-pixel-text mb-3">
            开始转化
          </h2>
          <p className="text-pixel-muted font-body">
            拖拽文档至此，开启知识传承
          </p>
        </div>

        {/* Upload dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => status === 'idle' && inputRef.current?.click()}
          className={cn(
            'relative cursor-pointer overflow-hidden transition-all duration-100',
            'min-h-[260px] flex flex-col items-center justify-center',
            'pixel-border bg-pixel-card',
            isDragging && 'border-pixel-primary shadow-[0_0_20px_rgba(0,217,255,0.2)]',
            status === 'done' && 'border-pixel-success',
            status === 'error' && 'border-pixel-danger'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.md,.txt"
            onChange={handleFileSelect}
          />

          {/* Scanline effect inside box */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--pixel-primary) 2px, var(--pixel-primary) 4px)',
            }}
          />

          {status === 'idle' && (
            <div className="text-center relative z-10">
              <div
                className={cn(
                  'w-20 h-20 mx-auto mb-5 flex items-center justify-center transition-all duration-100',
                  'border-4 border-pixel-border bg-pixel-bg',
                  isDragging && 'border-pixel-primary bg-pixel-primary/10 scale-110'
                )}
              >
                <Upload className={cn('w-10 h-10', isDragging ? 'text-pixel-primary' : 'text-pixel-muted')} />
              </div>
              <p className="font-body text-xl text-pixel-text mb-2">
                {isDragging ? '松开即可开始转化' : '拖拽文档到这里，或点击选择'}
              </p>
              <p className="font-pixel text-[10px] text-pixel-muted tracking-wider">
                PDF · DOCX · MD · TXT (最大 20MB)
              </p>
            </div>
          )}

          {status === 'uploading' && (
            <div className="text-center relative z-10 w-full max-w-xs mx-auto">
              {/* Pixel progress bar */}
              <div className="w-full h-6 bg-pixel-bg border-2 border-pixel-border mb-4 relative overflow-hidden">
                <div 
                  className="h-full bg-pixel-primary transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center font-pixel text-[10px] text-pixel-bg">
                  {uploadProgress}%
                </span>
              </div>
              <p className="font-body text-lg text-pixel-text animate-pulse-pixel">正在上传...</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center relative z-10">
              <div className="w-16 h-16 border-4 border-pixel-primary mx-auto mb-5 flex items-center justify-center animate-pulse-pixel">
                <Zap className="w-8 h-8 text-pixel-primary" />
              </div>
              <p className="font-body text-lg text-pixel-text mb-6">正在炼金转化...</p>
              <div className="flex items-center justify-center gap-2 md:gap-4">
                {PROCESSING_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'w-8 h-8 border-2 flex items-center justify-center transition-all duration-300 font-pixel text-[10px]',
                        i < currentStep
                          ? 'border-pixel-success bg-pixel-success/20 text-pixel-success'
                          : i === currentStep
                            ? 'border-pixel-primary bg-pixel-primary/20 text-pixel-primary animate-pulse-pixel'
                            : 'border-pixel-border bg-pixel-bg text-pixel-muted'
                      )}
                    >
                      {i < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'font-pixel text-[8px] tracking-wider',
                        i < currentStep ? 'text-pixel-success' : i === currentStep ? 'text-pixel-primary' : 'text-pixel-muted'
                      )}
                    >
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="text-center relative z-10">
              <div className="w-16 h-16 border-4 border-pixel-success bg-pixel-success/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-pixel-success" />
              </div>
              <p className="font-body text-xl text-pixel-text mb-2">转化完成</p>
              <p className="font-pixel text-[10px] text-pixel-muted tracking-wider">向下滚动查看生成的教程</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center relative z-10">
              <div className="w-16 h-16 border-4 border-pixel-danger bg-pixel-danger/20 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-pixel-danger" />
              </div>
              <p className="font-body text-xl text-pixel-text mb-2">出错了</p>
              <p className="font-pixel text-[10px] text-pixel-danger mb-4">{errorMsg}</p>
              <button
                onClick={handleRetry}
                className="pixel-btn text-sm px-4 py-2"
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
