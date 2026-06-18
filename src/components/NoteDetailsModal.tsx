import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Clock, FileText, Heart, Image as ImageIcon, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { User } from 'firebase/auth';
import { Note, Comment } from '../types';

interface NoteDetailsModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  comments: Comment[];
  onAddComment: (commentText: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLike: () => void;
  isAdmin?: boolean;
  onApproveNote?: () => void;
  onDeleteNote?: () => void;
  onViewProfile: (userId: string, authorName: string) => void;
}

export default function NoteDetailsModal({
  note, isOpen, onClose, user, onLogin,
  comments, onAddComment, onDeleteComment,
  onLike, isAdmin = false, onApproveNote, onDeleteNote,
  onViewProfile
}: NoteDetailsModalProps) {
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveImageTab(0);
    setIsFullscreenImage(null);
    setSlideIndex(0);
  }, [note?.id]);

  if (!isOpen || !note) return null;

  const isLiked = user ? !!(note.likes?.[user.uid]) : false;

  const goTo = (idx: number) => setSlideIndex(idx);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && slideIndex === 0) goTo(1);
      if (diff < 0 && slideIndex === 1) goTo(0);
    }
    touchStartX.current = null;
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;
    setSubmittingComment(true);
    try {
      await onAddComment(commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error('Comment failed:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = (rawDate: any) => {
    if (!rawDate) return 'Recently';
    const dateObj = typeof rawDate.toDate === 'function' ? rawDate.toDate() : new Date(rawDate);
    return isNaN(dateObj.getTime()) ? 'Recently' : dateObj.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEmbeddablePdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com') && url.includes('/view')) return url.replace('/view', '/preview');
    return url;
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800">

        {/* Header tabs */}
        <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 px-1">
          <button
            onClick={() => goTo(0)}
            className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors relative ${
              slideIndex === 0
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            Content
            {slideIndex === 0 && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            )}
          </button>

          <button
            onClick={() => goTo(1)}
            className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors relative sm:hidden ${
              slideIndex === 1
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            Discussion
            {comments.length > 0 && (
              <span className="ml-1 text-[9px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full px-1.5 py-0.5 font-mono">
                {comments.length}
              </span>
            )}
            {slideIndex === 1 && (
              <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
            )}
          </button>

          <div className="hidden sm:flex items-center px-3 gap-1.5 text-xs font-mono uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Q&A
          </div>

          <button
            onClick={onClose}
            className="px-4 py-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-row">
          <div
            ref={sliderRef}
            className="flex-1 overflow-hidden sm:contents"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full sm:contents"
              style={{
                width: '200%',
                transform: `translateX(${slideIndex === 0 ? '0%' : '-50%'})`,
                transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* ── CONTENT PANEL ── */}
              <div
                className="overflow-y-auto p-5 flex flex-col gap-5 sm:flex-1 sm:border-r sm:border-zinc-100 sm:dark:border-zinc-800 slide-content"
                style={{ width: '50%', minWidth: 0 }}
              >
                <style>{`
                  @media (min-width: 640px) {
                    .slide-content { width: auto !important; flex: 1 !important; }
                    .slide-discussion { width: 320px !important; }
                    .slide-track { width: auto !important; transform: none !important; }
                  }
                `}</style>

                {/* Breadcrumb + title */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    <span>{note.category}</span>
                    <span>/</span>
                    <span className="text-zinc-600 dark:text-zinc-300">{note.subcategory}</span>
                  </div>
                  <h2
                    className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 leading-snug"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {note.title}
                  </h2>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin toolbar */}
                {isAdmin && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400">Moderator</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-mono ${note.isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {note.isApproved ? 'approved' : 'pending review'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!note.isApproved && onApproveNote && (
                        <button
                          onClick={onApproveNote}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {onDeleteNote && (
                        <button
                          onClick={onDeleteNote}
                          className="text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Author + Like */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                  <button 
                    onClick={() => onViewProfile(note.userId, note.authorName)}
                    className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded-lg p-0.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-300 text-xs group-hover:border-zinc-400 dark:group-hover:border-zinc-500 transition-colors">
                      {note.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover:underline decoration-zinc-400">
                        {note.authorName}
                      </p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">view architecture row</p>
                    </div>
                  </button>
                  <button
                    onClick={onLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                      isLiked
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 dark:fill-red-400' : ''}`} />
                    {note.likesCount || 0}
                  </button>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Summary</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                    {note.description}
                  </p>
                </div>

                {/* Notes / Formulas */}
                {note.content && (
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Notes & Formulas</p>
                    <div className="text-[13px] text-zinc-100 font-mono leading-relaxed whitespace-pre-line bg-zinc-950 dark:bg-zinc-950 p-4 rounded-xl overflow-x-auto border border-zinc-800">
                      {note.content}
                    </div>
                  </div>
                )}

                {/* Images */}
                {note.imageUrls && note.imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          Engineering Sheets
                        </p>
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {note.imageUrls.length} pages
                      </span>
                    </div>
                    <div className="relative aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                      <img
                        src={note.imageUrls[activeImageTab]}
                        alt={`Sheet ${activeImageTab + 1}`}
                        className="max-h-full max-w-full object-contain cursor-zoom-in"
                        onClick={() => setIsFullscreenImage(note.imageUrls![activeImageTab])}
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-0.5 text-[10px] font-mono rounded">
                        {activeImageTab + 1} / {note.imageUrls.length}
                      </div>
                    </div>
                    {note.imageUrls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {note.imageUrls.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveImageTab(idx)}
                            className={`w-14 h-10 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${
                              activeImageTab === idx
                                ? 'border-zinc-900 dark:border-zinc-100 scale-95'
                                : 'border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PDF */}
                {note.pdfUrl && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                      <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">PDF Document</p>
                    </div>
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 h-[380px]">
                      <iframe src={getEmbeddablePdfUrl(note.pdfUrl)} title="PDF" width="100%" height="100%" style={{ border: 'none' }} />
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono text-center mt-1">read-only pdf view</p>
                  </div>
                )}

                {/* Mobile swipe hint */}
                <div className="sm:hidden flex items-center justify-center gap-2 pb-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                  <span>swipe left for discussion →</span>
                </div>
              </div>

              {/* ── DISCUSSION PANEL ── */}
              <div
                className="flex flex-col bg-zinc-50/50 dark:bg-zinc-900/80 border-zinc-100 dark:border-zinc-800 overflow-hidden slide-discussion"
                style={{ width: '50%', minWidth: 0, borderLeft: '1px solid' }}
              >
                {/* Comments list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400 py-16">
                      <MessageCircle className="w-7 h-7 text-zinc-200 dark:text-zinc-700 mb-3" />
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">No discussions yet.</p>
                      <p className="text-[10px] mt-1 text-zinc-400 dark:text-zinc-600 font-mono">be the first to post</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl p-3 space-y-1.5"
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{comment.authorName}</p>
                            <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{formattedDate(comment.createdAt)}
                            </p>
                          </div>
                          {user && comment.userId === user.uid && (
                            <button
                              onClick={() => onDeleteComment(comment.id)}
                              className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 cursor-pointer p-0.5 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="flex gap-1.5 items-end">
                      <textarea
                        required rows={2} maxLength={500}
                        placeholder="Ask a question or add notes..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentInput.trim()}
                        className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 p-2.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-xl text-center">
                      <p className="text-[11px] font-medium text-amber-800 dark:text-amber-400 mb-2">Sign in to join discussion</p>
                      <button
                        onClick={onLogin}
                        className="text-[11px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors"
                      >
                        Sign In with Google
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mobile dot nav */}
        <div className="sm:hidden flex items-center justify-center gap-2 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
          <button
            onClick={() => goTo(0)}
            className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
            style={{ background: slideIndex === 0 ? (document.documentElement.classList.contains('dark') ? '#f4f4f5' : '#18181b') : '#d4d4d8' }}
          />
          <button
            onClick={() => goTo(1)}
            className="w-1.5 h-1.5 rounded-full transition-all cursor-pointer"
            style={{ background: slideIndex === 1 ? (document.documentElement.classList.contains('dark') ? '#f4f4f5' : '#18181b') : '#d4d4d8' }}
          />
        </div>

      </div>

      {/* Fullscreen lightbox */}
      {isFullscreenImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreenImage(null)}
        >
          <button
            onClick={() => setIsFullscreenImage(null)}
            className="absolute top-5 right-5 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={isFullscreenImage} alt="Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
          <p className="absolute bottom-5 inset-x-0 text-center text-white/40 text-[10px] font-mono">tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}