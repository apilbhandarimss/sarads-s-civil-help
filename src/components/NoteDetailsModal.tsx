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
}

export default function NoteDetailsModal({
  note, isOpen, onClose, user, onLogin,
  comments, onAddComment, onDeleteComment,
  onLike, isAdmin = false, onApproveNote, onDeleteNote
}: NoteDetailsModalProps) {
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState<string | null>(null);
  // 0 = content, 1 = discussion
  const [slideIndex, setSlideIndex] = useState(0);

  // Touch swipe tracking
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
      if (diff > 0 && slideIndex === 0) goTo(1); // swipe left → discussion
      if (diff < 0 && slideIndex === 1) goTo(0); // swipe right → content
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full max-w-4xl h-[95vh] sm:h-[90vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ── Header bar ── */}
        <div className="flex items-center border-b border-slate-100 bg-white shrink-0 px-1">
          {/* Tab: Content */}
          <button
            onClick={() => goTo(0)}
            className="flex-1 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-all relative"
            style={{ color: slideIndex === 0 ? '#0f172a' : '#94a3b8' }}
          >
            📄 Content
            {slideIndex === 0 && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          {/* Tab: Discussion (mobile only — on desktop it's always visible alongside) */}
          <button
            onClick={() => goTo(1)}
            className="flex-1 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-all relative sm:hidden"
            style={{ color: slideIndex === 1 ? '#0f172a' : '#94a3b8' }}
          >
            💬 Discussion
            {comments.length > 0 && (
              <span className="ml-1 text-[10px] bg-slate-900 text-white rounded-full px-1.5 py-0.5 font-mono">
                {comments.length}
              </span>
            )}
            {slideIndex === 1 && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-slate-900 rounded-full" />
            )}
          </button>

          {/* Desktop: Q&A label */}
          <div className="hidden sm:flex items-center px-3 gap-1.5 text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            Q&A
          </div>

          <button onClick={onClose} className="px-4 py-3.5 text-slate-400 hover:text-slate-700 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-hidden flex flex-row">

          {/*
            MOBILE: sliding viewport — both panels sit side by side in a 200%-wide track,
            translateX shifts between them with CSS transition.
            DESKTOP (sm+): both panels always visible side by side normally.
          */}

          {/* Mobile slider track */}
          <div
            ref={sliderRef}
            className="flex-1 overflow-hidden sm:contents"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Inner sliding row — 200% wide on mobile, normal flex on desktop */}
            <div
              className="flex h-full sm:contents"
              style={{
                width: '200%',
                transform: `translateX(${slideIndex === 0 ? '0%' : '-50%'})`,
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* ── CONTENT PANEL ── */}
              <div
                className="overflow-y-auto p-5 flex flex-col gap-6 sm:flex-1 sm:border-r sm:border-slate-100"
                style={{ width: '50%', minWidth: 0 }}
              >
                {/* sm+ override: full width within flex */}
                <style>{`
                  @media (min-width: 640px) {
                    .slide-content { width: auto !important; flex: 1 !important; }
                    .slide-discussion { width: 320px !important; }
                    .slide-track { width: auto !important; transform: none !important; }
                  }
                `}</style>

                {/* Breadcrumb + title */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400">
                    <span>{note.category}</span><span>/</span>
                    <span className="text-slate-600">{note.subcategory}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-slate-900 leading-tight">{note.title}</h2>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin toolbar */}
                {isAdmin && (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-amber-900 font-mono uppercase tracking-wider">Moderator Toolbox</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${note.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <p className="text-xs text-slate-600">Status: <strong>{note.isApproved ? 'Approved & Public' : 'Pending Review'}</strong></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!note.isApproved && onApproveNote && (
                        <button onClick={onApproveNote} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer">
                          Approve & Publish
                        </button>
                      )}
                      {onDeleteNote && (
                        <button onClick={onDeleteNote} className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Author + Like */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {note.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{note.authorName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Contributor</p>
                    </div>
                  </div>
                  <button onClick={onLike} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
                    isLiked ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}>
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                    {note.likesCount || 0} Likes
                  </button>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-2">Summary</h4>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">{note.description}</p>
                </div>

                {/* Notes / Formulas */}
                {note.content && (
                  <div>
                    <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500 mb-2">Notes & Formulas</h4>
                    <div className="text-[13px] text-slate-100 font-mono leading-relaxed whitespace-pre-line bg-slate-900 p-5 rounded-xl overflow-x-auto border border-slate-950">
                      {note.content}
                    </div>
                  </div>
                )}

                {/* Images */}
                {note.imageUrls && note.imageUrls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Engineering Sheets</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">{note.imageUrls.length} pages</span>
                    </div>
                    <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden border border-slate-950 flex items-center justify-center">
                      <img
                        src={note.imageUrls[activeImageTab]}
                        alt={`Sheet ${activeImageTab + 1}`}
                        className="max-h-full max-w-full object-contain cursor-zoom-in"
                        onClick={() => setIsFullscreenImage(note.imageUrls![activeImageTab])}
                      />
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 text-[10px] font-mono rounded-md">
                        {activeImageTab + 1} / {note.imageUrls.length}
                      </div>
                    </div>
                    {note.imageUrls.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto py-1">
                        {note.imageUrls.map((url, idx) => (
                          <button key={idx} onClick={() => setActiveImageTab(idx)}
                            className={`w-16 h-12 rounded-md overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-all ${activeImageTab === idx ? 'border-slate-900 scale-95' : 'border-slate-200'}`}>
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
                      <FileText className="w-4 h-4 text-slate-500" />
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">PDF Document</h4>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-[400px]">
                      <iframe src={getEmbeddablePdfUrl(note.pdfUrl)} title="PDF" width="100%" height="100%" style={{ border: 'none' }} />
                    </div>
                    <p className="text-[10px] text-slate-400 italic text-center mt-1">Read-only PDF view</p>
                  </div>
                )}

                {/* Mobile: swipe hint at bottom of content */}
                <div className="sm:hidden flex items-center justify-center gap-2 pb-2 text-[10px] text-slate-400 font-mono">
                  <span>swipe left for discussion</span>
                  <span>→</span>
                </div>
              </div>

              {/* ── DISCUSSION PANEL ── */}
              <div
                className="flex flex-col bg-slate-50/50 border-slate-100 overflow-hidden"
                style={{ width: '50%', minWidth: 0, borderLeft: '1px solid #f1f5f9' }}
              >
                {/* Comments list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-16">
                      <MessageCircle className="w-8 h-8 text-slate-200 mb-3" />
                      <p className="text-xs font-medium">No discussions yet.</p>
                      <p className="text-[10px] mt-1">Be the first to post!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2 shadow-sm">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{comment.authorName}</p>
                            <p className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />{formattedDate(comment.createdAt)}
                            </p>
                          </div>
                          {user && comment.userId === user.uid && (
                            <button onClick={() => onDeleteComment(comment.id)} className="text-slate-400 hover:text-rose-600 cursor-pointer p-0.5 rounded hover:bg-rose-50">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{comment.text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment input */}
                <div className="p-4 border-t border-slate-100 shrink-0">
                  {user ? (
                    <form onSubmit={handleCommentSubmit} className="flex gap-1.5 items-end">
                      <textarea
                        required rows={2} maxLength={500}
                        placeholder="Ask a question or add notes..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none"
                      />
                      <button type="submit" disabled={submittingComment || !commentInput.trim()}
                        className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 disabled:opacity-40 cursor-pointer flex items-center justify-center shrink-0">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center">
                      <p className="text-[11px] font-semibold text-amber-800 mb-2">Sign in to join discussion</p>
                      <button onClick={onLogin} className="text-[11px] bg-white border border-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        Sign In with Google
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>{/* end slide track */}
          </div>{/* end mobile slider wrapper */}

        </div>{/* end body */}

        {/* ── Mobile dot indicators ── */}
        <div className="sm:hidden flex items-center justify-center gap-2 py-2 border-t border-slate-100 bg-white shrink-0">
          <button onClick={() => goTo(0)}
            className="w-2 h-2 rounded-full transition-all cursor-pointer"
            style={{ background: slideIndex === 0 ? '#0f172a' : '#cbd5e1' }}
          />
          <button onClick={() => goTo(1)}
            className="w-2 h-2 rounded-full transition-all cursor-pointer"
            style={{ background: slideIndex === 1 ? '#0f172a' : '#cbd5e1' }}
          />
        </div>

      </div>{/* end modal card */}

      {/* Fullscreen lightbox */}
      {isFullscreenImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setIsFullscreenImage(null)}>
          <button onClick={() => setIsFullscreenImage(null)} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer">
            <X className="w-6 h-6" />
          </button>
          <img src={isFullscreenImage} alt="Fullscreen" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg" />
          <p className="absolute bottom-6 inset-x-0 text-center text-white/50 text-xs font-mono">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}