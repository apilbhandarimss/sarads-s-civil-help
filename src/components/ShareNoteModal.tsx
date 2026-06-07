import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Plus, Sparkles, X } from 'lucide-react';
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
  'Sample Questions'
];

// Preset assets to make it delightful for users who want beautiful civil drawings instantly
const CIVIL_PRESET_IMAGES = [
  {
    name: 'Singly Reinforced Beam Design',
    url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&q=80'
  },
  {
    name: 'Concrete Compressive Testing',
    url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&q=80'
  },
  {
    name: 'Surveying Total Station Set',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
  }
];

export default function ShareNoteModal({ isOpen, onClose, onShare }: ShareNoteModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<NoteCategory>('bachelors');
  const [subcategory, setSubcategory] = useState('');
  const [content, setContent] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Images manager
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const currentCategorySpec = CATEGORIES.find(c => c.id === category);
  const subcategoryList = currentCategorySpec ? currentCategorySpec.subcategories.filter(s => s !== 'All Subcategories') : [];

  const handleAddImage = (url: string) => {
    if (!url) return;
    if (imageUrls.length >= 10) {
      setErrorText('Maximum of 10 images are allowed for embedding.');
      return;
    }
    // Simple verification
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setErrorText('Please enter a valid HTTP or HTTPS image link.');
      return;
    }
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
      setErrorText('Please fill out all required fields marked with *');
      return;
    }
    
    setErrorText('');
    setSubmitting(true);
    try {
      await onShare({
        title,
        description,
        category,
        subcategory,
        content: content || undefined,
        pdfUrl: pdfUrl || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined
      });
      // Reset form
      setTitle('');
      setDescription('');
      setCategory('bachelors');
      setSubcategory('');
      setContent('');
      setPdfUrl('');
      setImageUrls([]);
      setSelectedTags([]);
      onClose();
    } catch (err: any) {
      setErrorText(err.message || 'Failed to submit study note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="share-modal-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="share-modal-window"
        className="bg-white border border-slate-100 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-slate-850">
                Share Civil Help Material
              </h2>
              <p className="text-xs text-slate-400">
                Distribute helpful civil files, templates or sheets.
              </p>
            </div>
          </div>
          <button
            id="share-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorText && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-700 text-xs font-medium">
              {errorText}
            </div>
          )}

          {/* Core Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                Category / Target *
              </label>
              <select
                required
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as NoteCategory);
                  setSubcategory('');
                }}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-705 focus:outline-slate-350"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                Subcategory / Subject *
              </label>
              <select
                required
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-705 focus:outline-slate-350"
              >
                <option value="">-- Choose Subject-Field --</option>
                {subcategoryList.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
              Material Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Surveying Field Book Calculations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-slate-350"
            />
          </div>

          {/* Tags Selection Block */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
              Apply Tags / Classify Material
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter(t => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer select-none transition-all duration-150 ${
                      isSelected
                        ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Select one or more categories, such as <strong className="text-slate-500">"Apply for Notes"</strong> to indicate requests or specific templates.
            </p>
          </div>

          {/* Overview summary */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
              Short Description / Index *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Give a brief summary of what's inside this material (chapters covered, formula list, etc.)."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-slate-350 resize-none font-sans"
            />
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
              Explanatory Notes / Formulas (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Add key formulas, syllabus details, or important text notes."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-800 placeholder-slate-400 focus:outline-slate-350 font-sans"
            />
          </div>

          {/* Read Only PDF URL */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-500" />
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                Read-Only PDF URL (Optional)
              </label>
            </div>
            <input
              type="url"
              placeholder="Paste direct PDF link or Google Drive embed URL"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              className="w-full text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-slate-350"
            />
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">
              Note: This will render as an embedded interactive and secure reader right on the material page. Perfect for PDFs hosted on Drive, Dropbox or directly on websites.
            </p>
          </div>

          {/* Embedded image list */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">
                  Embed Image Pages
                </label>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {imageUrls.length}/10 Images
              </span>
            </div>

            {/* Quick Presets */}
            <div className="mb-3">
              <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Use demo architectural / civil presets for testing:</p>
              <div className="flex flex-wrap gap-2">
                {CIVIL_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="text-[10px] bg-white border border-slate-200 hover:border-slate-300 text-slate-600 px-2.5 py-1 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 font-medium shadow-xs"
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
                placeholder="Paste engineering drawing or notes page image URL..."
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
                className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-slate-350"
              />
              <button
                type="button"
                onClick={() => handleAddImage(currentImageUrl)}
                className="bg-slate-900 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Add Page
              </button>
            </div>

            {/* Image Preview List */}
            {imageUrls.length > 0 && (
              <div id="modal-image-previews" className="grid grid-cols-5 gap-2 mt-2">
                {imageUrls.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-slate-200 rounded-lg overflow-hidden border border-slate-200 group/item">
                    <img
                      src={img}
                      alt={`Note page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-slate-900/80 text-white p-0.5 rounded-full hover:bg-rose-600 cursor-pointer transition-colors shadow-xs"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/60 text-white text-[8px] font-mono text-center py-0.5">
                      Page {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            id="share-modal-close-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            id="share-modal-submit-btn"
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Publishing notes...' : 'Publish Study Notes'}
          </button>
        </div>
      </div>
    </div>
  );
}
