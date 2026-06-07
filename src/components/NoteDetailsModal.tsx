import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Clock, Eye, FileText, Heart, Image as ImageIcon, Send, Trash2, X } from 'lucide-react';
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
  note,
  isOpen,
  onClose,
  user,
  onLogin,
  comments,
  onAddComment,
  onDeleteComment,
  onLike,
  isAdmin = false,
  onApproveNote,
  onDeleteNote
}: NoteDetailsModalProps) {
  if (!isOpen || !note) return null;

  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<number>(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState<string | null>(null);

  const isLiked = user ? !!(note.likes && note.likes[user.uid]) : false;

  // Sync state when note opens
  useEffect(() => {
    setActiveImageTab(0);
    setIsFullscreenImage(null);
  }, [note.id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !user) return;

    setSubmittingComment(true);
    try {
      await onAddComment(commentInput.trim());
      setCommentInput('');
    } catch (err) {
      console.error('Failed to add discussion comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = (rawDate: any) => {
    if (!rawDate) return 'Recently';
    let dateObj: Date;
    if (rawDate && typeof rawDate.toDate === 'function') {
      dateObj = rawDate.toDate();
    } else {
      dateObj = new Date(rawDate);
    }
    return isNaN(dateObj.getTime()) ? 'Recently' : dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Convert regular PDF URL to Google Drive embed or use directly
  const getEmbeddablePdfUrl = (url: string) => {
    if (!url) return '';
    // If it is a Google Drive view link, convert to embed link
    if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    // Standard direct pdf link
    return url;
  };

  return (
    <div
      id="note-details-overlay"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div
        id="note-details-window"
        className="bg-white border border-slate-100 rounded-2xl w-full max-w-4xl h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
      >
        {/* Left Side: Document & Materials View Room */}
        <div className="flex-1 overflow-y-auto p-6 md:border-r border-slate-100 flex flex-col space-y-6">
          
          {/* Header Path & Title */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider font-mono text-slate-400">
              <span>{note.category}</span>
              <span>/</span>
              <span className="text-slate-600">{note.subcategory}</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 leading-tight">
              {note.title}
            </h2>
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {note.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] font-medium font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Admin Moderation Toolbar */}
          {isAdmin && (
            <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-amber-900 font-mono uppercase tracking-wider">Moderator Toolbox</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${note.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="text-xs text-slate-600 font-medium font-sans">
                    Status: <strong className="text-slate-800">{note.isApproved ? 'Approved & Public' : 'Pending Moderation Review'}</strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!note.isApproved && onApproveNote && (
                  <button
                    onClick={onApproveNote}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors shadow-xs"
                  >
                    Approve & Publish
                  </button>
                )}
                {onDeleteNote && (
                  <button
                    onClick={onDeleteNote}
                    className="bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 font-semibold text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Post
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Uploader Card */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-sm">
                {note.authorName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800">{note.authorName}</p>
                <p className="text-[10px] text-slate-400 font-mono">Contributor</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end gap-1.5">
              <button
                id="btn-modal-like"
                onClick={onLike}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold select-none cursor-pointer border ${
                  isLiked 
                    ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' 
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                <span>{note.likesCount || 0} Likes</span>
              </button>
            </div>
          </div>

          {/* Description Block */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Summary & Overview</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-xl border border-dashed border-slate-200">
              {note.description}
            </p>
          </div>

          {/* Long Text Explanatory Notes */}
          {note.content && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">Explanatory Notes & Formulas</h4>
              <div className="text-sm text-slate-700 font-sans leading-relaxed whitespace-pre-line bg-slate-900 text-slate-100 p-5 rounded-xl font-mono overflow-x-auto text-[13px] border border-slate-950">
                {note.content}
              </div>
            </div>
          )}

          {/* EMBEDDED IMAGES SHEETS (Website Embedding) */}
          {note.imageUrls && note.imageUrls.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                    Embedded Engineering Sheets
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                  {note.imageUrls.length} pages
                </span>
              </div>

              {/* Main Image Stage */}
              <div id="image-display-stage" className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden group/stage border border-slate-950 flex items-center justify-center">
                <img
                  src={note.imageUrls[activeImageTab]}
                  alt={`Embedded civil page ${activeImageTab + 1}`}
                  className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform group-hover/stage:scale-[1.01]"
                  onClick={() => setIsFullscreenImage(note.imageUrls![activeImageTab])}
                  title="Click to zoom page"
                />
                
                {/* Image controls overlay */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2.5 py-1 text-[10px] font-mono rounded-md">
                  Sheet {activeImageTab + 1} of {note.imageUrls.length}
                </div>
              </div>

              {/* Image selector deck */}
              {note.imageUrls.length > 1 && (
                <div id="image-thumb-deck" className="flex gap-2 overflow-x-auto py-1">
                  {note.imageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageTab(idx)}
                      className={`relative w-16 h-12 rounded-md overflow-hidden bg-slate-100 border-2 transition-all cursor-pointer flex-shrink-0 ${
                        activeImageTab === idx ? 'border-slate-905 scale-95 shadow-xs' : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* READ ONLY PDF INFRAME CANVAS */}
          {note.pdfUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-500">
                  Read-Only PDF Documents
                </h4>
              </div>

              {/* PDF Secure Embedded Iframe */}
              <div id="pdf-viewer-canvas" className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 h-[480px]">
                <iframe
                  src={getEmbeddablePdfUrl(note.pdfUrl)}
                  title="Read Only PDF Notebook"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                  className="w-full h-full"
                >
                  <p className="p-6 text-sm text-center text-slate-600">
                    Your browser does not support embedded PDF files. 
                    <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-semibold ml-1">
                      Click here to read PDF original.
                    </a>
                  </p>
                </iframe>
              </div>
              <p className="text-[10px] text-slate-400 font-sans italic text-center">
                This PDF is configured in read-only portal view inside Sarads's Civil Help.
              </p>
            </div>
          )}

        </div>

        {/* Right Side: Discussions, Comments & Community Feed */}
        <div className="w-full md:w-80 overflow-y-auto p-6 bg-slate-50/50 flex flex-col justify-between h-full border-t md:border-t-0 border-slate-100">
          
          {/* Header Close */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <span className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Q&A Discussion
            </span>
            <button
              id="btn-details-close"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments Feed View */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-[180px]">
            {comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
                <p className="text-xs font-medium">No discussions yet.</p>
                <p className="text-[10px] text-slate-400 mt-1">Be the first to post a query or tip!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-slate-100 rounded-xl p-3.5 space-y-2 text-left shadow-xs">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-normal">
                        {comment.authorName}
                      </p>
                      <p className="text-[9px] text-slate-450 font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {formattedDate(comment.createdAt)}
                      </p>
                    </div>

                    {user && comment.userId === user.uid && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-slate-350 hover:text-rose-600 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-rose-50"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-sans leading-relaxed whitespace-pre-line">
                    {comment.text}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Comment Form Input */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-1.5 items-end">
                <textarea
                  required
                  rows={2}
                  maxLength={500}
                  placeholder="Ask a question, add notes, or correct formulas..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-slate-350 resize-none font-sans"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !commentInput.trim()}
                  className="bg-slate-900 text-white p-2.5 rounded-lg hover:bg-slate-800 cursor-pointer disabled:opacity-40 select-none flex items-center justify-center shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-center">
                <p className="text-[11px] font-semibold text-amber-800 mb-2">Want to participate in discussion?</p>
                <button
                  id="btn-comment-signin"
                  onClick={onLogin}
                  className="text-[11px] bg-white border border-amber-250 text-slate-800 font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer shadow-xs inline-block"
                >
                  Sign In with Google
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FULLSCREEN IMAGE VIEWER LIGHTBOX */}
      {isFullscreenImage && (
        <div
          id="lightbox-overlay"
          className="fixed inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreenImage(null)}
        >
          <button
            onClick={() => setIsFullscreenImage(null)}
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={isFullscreenImage}
            alt="Expanded view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
          />
          <p className="absolute bottom-6 inset-x-0 text-center text-white/60 text-xs font-mono select-none">
            Click anywhere to close zoom level
          </p>
        </div>
      )}
    </div>
  );
}
