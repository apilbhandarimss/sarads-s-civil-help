import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Plus, X } from 'lucide-react';
import { CATEGORIES, NoteCategory } from '../types';

interface ShareNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (noteData: {
    title: string;
    description: string;
    category: NoteCategory;
    subcategory: string;
    content?: string;
    pdfUrl?: string;
    imageUrls?: string[];
    tags?: string[];
  }) => Promise<void>;
}

const AVAILABLE_TAGS = [
  'Apply for Notes',
  'Handwritten Notes',
  'Formula Sheet',
  'Past Exam Solution',
  'Syllabus & Curriculum',
  'Tutorial Handout',
  'Lab Manual/Report',
  'Sample Questions',
];

const CIVIL_PRESET_IMAGES = [
  { name: 'Singly Reinforced Beam Design', url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&q=80' },
  { name: 'Concrete Compressive Testing', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&q=80' },
  { name: 'Surveying Total Station Set', url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' },
];

// shared input class
const inputCls = 'w-full text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500';
const labelCls = 'block text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5';

export default function ShareNoteModal({ isOpen, onClose, onShare }: ShareNoteModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoteCategory>('bachelors');
  const [subcategory, setSubcategory] = useState('');
  const [content, setContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  if (!isOpen) return null;

  const currentCategorySpec = CATEGORIES.find(c => c.id === category);
  const subcategoryList = currentCategorySpec
    ? currentCategorySpec.subcategories.filter(s => s !== 'All Subcategories')
    : [];

  const handleAddImage = (url: string) => {
    if (!url) return;
    if (imageUrls.length >= 10) { setErrorText('Maximum 10 images allowed.'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) { setErrorText('Please enter a valid HTTP/HTTPS URL.'); return; }
    setImageUrls([...imageUrls, url]);
    setCurrentImageUrl('');
    setErrorText('');
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
    setErrorText('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !subcategory) {
      setErrorText('Please fill all required fields (*).');
      return;
    }
    setErrorText('');
    setSubmitting(true);
    try {
      await onShare({
        title, description, category, subcategory,
        content: content || undefined,
        pdfUrl: pdfUrl || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
      setTitle(''); setDescription(''); setCategory('bachelors'); setSubcategory('');
      setContent(''); setPdfUrl(''); setImageUrls([]); setSelectedTags([]);
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="share-modal-window"
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2
              className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Share Material
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              Distribute helpful civil files, templates or sheets.
            </p>
          </div>
          <button
            id="share-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorText && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs">
              {errorText}
            </div>
          )}

          {/* Category + Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select
                required value={category}
                onChange={(e) => { setCategory(e.target.value as NoteCategory); setSubcategory(''); }}
                className={inputCls}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Subcategory / Subject *</label>
              <select
                required value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className={inputCls}
              >
                <option value="">-- Choose Subject --</option>
                {subcategoryList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Material Title *</label>
            <input
              type="text" required
              placeholder="e.g. Surveying Field Book Calculations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className={inputCls}
            />
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag} type="button"
                    onClick={() =>
                      setSelectedTags(isSelected
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs border cursor-pointer select-none transition-all duration-100 ${
                      isSelected
                        ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900 font-medium'
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Short Description *</label>
            <textarea
              required rows={2}
              placeholder="Brief summary of what's inside this material."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Content */}
          <div>
            <label className={labelCls}>Notes / Formulas (optional)</label>
            <textarea
              rows={4}
              placeholder="Add key formulas, syllabus details, or important notes."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* PDF URL */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              <label className={labelCls + ' mb-0'}>Read-Only PDF URL (optional)</label>
            </div>
            <input
              type="url"
              placeholder="Paste PDF link or Google Drive embed URL"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className={inputCls}
            />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1.5">
              Rendered as an embedded reader. Works with Drive, Dropbox, or direct links.
            </p>
          </div>

          {/* Images */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <label className={labelCls + ' mb-0'}>Embed Image Pages (optional)</label>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">{imageUrls.length}/10</span>
            </div>

            {/* Presets */}
            <div className="mb-3">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mb-1.5">demo presets:</p>
              <div className="flex flex-wrap gap-1.5">
                {CIVIL_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name} type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="text-[10px] bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-lg cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* URL input */}
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                placeholder="Paste image URL..."
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => handleAddImage(currentImageUrl)}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg px-3 py-2 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>

            {/* Image previews */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {imageUrls.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-zinc-200 dark:bg-zinc-700 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-600 group/item">
                    <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded-full hover:bg-red-600 cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-mono text-center py-0.5">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-zinc-50/50 dark:bg-zinc-900/80">
          <button
            id="share-modal-close-cancel-btn"
            type="button" onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer bg-white dark:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            id="share-modal-submit-btn"
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}