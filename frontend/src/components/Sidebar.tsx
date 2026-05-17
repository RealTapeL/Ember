import { useState, useCallback, useEffect } from 'react';
import { Upload, Folder, FileText, Trash2, Loader2, Plus, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDocuments, deleteDocument, uploadDocument, updateDocumentCategory, getTutorialByDocument, exportTutorialUrl, type DocumentItem } from '@/lib/api';

interface SidebarProps {
  selectedDocId: number | null;
  onSelectDoc: (doc: DocumentItem | null) => void;
  onUploadComplete: () => void;
  onOpenReader: (doc: DocumentItem) => void;
}

const DEFAULT_CATEGORIES = ['全部', '未分类', '技术文档', '学习笔记', '论文', '其他'];

export default function Sidebar({ selectedDocId, onSelectDoc, onUploadComplete, onOpenReader }: SidebarProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['全部']));
  const [newCategory, setNewCategory] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [exportingId, setExportingId] = useState<number | null>(null);

  const fetchDocs = useCallback(async () => {
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
    fetchDocs();
    const interval = setInterval(fetchDocs, 5000);
    return () => clearInterval(interval);
  }, [fetchDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      await fetchDocs();
      onUploadComplete();
    } catch (err: any) {
      alert(err.response?.data?.detail || '上传失败');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('确定删除此文档？')) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      if (selectedDocId === id) onSelectDoc(null);
      await fetchDocs();
    } catch {
      alert('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetCategory = async (docId: number, category: string) => {
    try {
      await updateDocumentCategory(docId, category);
      await fetchDocs();
    } catch {
      alert('更新分类失败');
    }
  };

  const handleExportWord = async (e: React.MouseEvent, docId: number) => {
    e.stopPropagation();
    setExportingId(docId);
    try {
      const tutorial = await getTutorialByDocument(docId);
      const url = exportTutorialUrl(tutorial.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tutorial.title}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert('导出失败，文档可能尚未生成教程');
    } finally {
      setExportingId(null);
    }
  };

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const categories = Array.from(new Set([...DEFAULT_CATEGORIES, ...documents.map((d) => d.category).filter(Boolean)]));

  const filteredDocs = activeCategory === '全部'
    ? documents
    : documents.filter((d) => d.category === activeCategory);

  const docsByCategory = categories.filter((c) => c !== '全部').map((cat) => ({
    name: cat,
    docs: documents.filter((d) => d.category === cat),
  })).filter((g) => g.docs.length > 0);

  return (
    <div className="w-72 flex-shrink-0 h-full flex flex-col border-r-4 border-pixel-border bg-pixel-card">
      {/* Header */}
      <div className="p-4 border-b-4 border-pixel-border">
        <div className="flex items-center gap-2 mb-3">
          <Folder className="w-5 h-5 text-pixel-primary" />
          <h2 className="font-body text-lg text-pixel-text">文档库</h2>
        </div>
        <label className="pixel-btn w-full text-sm py-2 cursor-pointer block text-center">
          <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.docx,.doc,.md,.txt,.drawio" />
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
          ) : (
            <Upload className="w-4 h-4 inline mr-2" />
          )}
          上传文档
        </label>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-pixel-primary animate-spin" />
          </div>
        ) : (
          <>
            {/* All docs */}
            <div className="mb-2">
              <button
                onClick={() => setActiveCategory('全部')}
                className={cn(
                  'w-full text-left px-3 py-2 font-body text-sm transition-all',
                  activeCategory === '全部'
                    ? 'bg-pixel-primary text-pixel-bg'
                    : 'text-pixel-text hover:bg-pixel-secondary'
                )}
              >
                全部文档 ({documents.length})
              </button>
            </div>

            {/* Grouped by category */}
            {docsByCategory.map((group) => (
              <div key={group.name} className="mb-1">
                <button
                  onClick={() => toggleCat(group.name)}
                  className="w-full flex items-center justify-between px-2 py-1.5 text-pixel-muted font-pixel text-[10px] uppercase tracking-wider hover:text-pixel-text"
                >
                  <span>{group.name}</span>
                  {expandedCats.has(group.name) ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>
                {expandedCats.has(group.name) && (
                  <div className="space-y-1 ml-2">
                    {group.docs.map((doc) => (
                      <div
                        key={doc.id}
                        className={cn(
                          'group flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-all border-2',
                          selectedDocId === doc.id
                            ? 'border-pixel-primary bg-pixel-primary/10'
                            : 'border-transparent hover:border-pixel-border hover:bg-pixel-bg'
                        )}
                        onClick={() => onSelectDoc(doc)}
                      >
                        <FileText className="w-4 h-4 text-pixel-muted flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-xs text-pixel-text truncate">{doc.original_name}</p>
                          <p className="font-pixel text-[8px] text-pixel-muted">{doc.file_type.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.status === 'completed' && (
                            <button
                              onClick={(e) => handleExportWord(e, doc.id)}
                              disabled={exportingId === doc.id}
                              className="p-1 text-pixel-muted hover:text-pixel-primary"
                              title="导出Word教程"
                            >
                              {exportingId === doc.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Download className="w-3 h-3" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenReader(doc); }}
                            className="p-1 text-pixel-muted hover:text-pixel-primary"
                            title="阅读"
                          >
                            <Folder className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, doc.id)}
                            disabled={deletingId === doc.id}
                            className="p-1 text-pixel-muted hover:text-pixel-danger"
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Add new category */}
            {showNewCatInput ? (
              <div className="flex items-center gap-1 mt-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="新分类名"
                  className="pixel-input text-xs py-1 px-2 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCategory.trim() && selectedDocId) {
                      handleSetCategory(selectedDocId, newCategory.trim());
                      setNewCategory('');
                      setShowNewCatInput(false);
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (newCategory.trim() && selectedDocId) {
                      handleSetCategory(selectedDocId, newCategory.trim());
                      setNewCategory('');
                      setShowNewCatInput(false);
                    }
                  }}
                  className="pixel-btn py-1 px-2 text-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCatInput(true)}
                className="mt-2 flex items-center gap-1 text-pixel-muted hover:text-pixel-primary font-pixel text-[10px]"
              >
                <Plus className="w-3 h-3" />
                新建分类
              </button>
            )}
            <p className="text-pixel-muted font-pixel text-[8px] mt-1">
              提示：选中文档后点击新建分类可归类
            </p>
          </>
        )}
      </div>
    </div>
  );
}
