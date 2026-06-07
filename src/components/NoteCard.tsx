import React from 'react';
import { FileText, Heart, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  currentUserId: string | null;
  onLike: (noteId: string, event: React.MouseEvent) => void;
}

export default function NoteCard({ note, onView, currentUserId, onLike }: NoteCardProps) {
  const isLiked = currentUserId ? !!(note.likes && note.likes[currentUserId]) : false;

  const categoryThemes = {
    loksewa: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    license: 'bg-amber-50 text-amber-700 border-amber-100',
    bachelors: 'bg-blue-50 text-blue-700 border-blue-100',
    entrance: 'bg-violet-50 text-violet-700 border-violet-100',
    masters: 'bg-rose-50 text-rose-700 border-rose-100'
  };

  const formattedDate = () => {
    if (!note.createdAt) return 'Recent';
    
    // Support firebase Timestamp structure OR ISO string
    let dateObj: Date;
    if (note.createdAt && typeof note.createdAt.toDate === 'function') {
      dateObj = note.createdAt.toDate();
    } else {
      dateObj = new Date(note.createdAt);
    }
    
    return isNaN(dateObj.getTime()) ? 'Recent' : dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onView(note)}
      className="bg-white border border-slate-100 rounded-xl p-5 hover:border-slate-300 transition-all duration-200 hover:shadow-xs flex flex-col justify-between min-h-[270px] h-auto group cursor-pointer"
    >
      <div id={`card-heading-${note.id}`}>
        {/* Meta Line - Category & Subcategory */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-[10px] font-semibold font-mono uppercase px-2 py-0.5 rounded-full border ${categoryThemes[note.category] || 'bg-slate-50 text-slate-700 border-slate-100'}`}
          >
            {note.category}
          </span>
          {note.subcategory && note.subcategory !== 'All Subcategories' && (
            <span className="text-[10px] font-medium font-sans text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
              {note.subcategory}
            </span>
          )}
          {note.isApproved === false && (
            <span className="text-[10px] font-bold font-mono uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              Pending Review
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-semibold text-slate-900 group-hover:text-slate-800 line-clamp-1 mb-1.5 transition-colors">
          {note.title}
        </h3>

        {/* Tags list */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {note.tags.map((tag, i) => (
              <span key={i} className="text-[10px] font-medium font-mono text-slate-500 bg-slate-100/80 hover:bg-slate-100 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-sm text-slate-500 line-clamp-3 mb-4 font-sans leading-relaxed">
          {note.description}
        </p>
      </div>

      <div id={`card-footer-${note.id}`} className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
        {/* Attachment Indicators & Likes Action */}
        <div className="flex items-center gap-3">
          {/* Liking Button */}
          <button
            id={`btn-like-${note.id}`}
            onClick={(event) => onLike(note.id, event)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-md transition-colors cursor-pointer ${
              isLiked 
                ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700' 
                : 'text-slate-400 bg-slate-50 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title={currentUserId ? (isLiked ? 'Unlike note' : 'Like note') : 'Sign in to like'}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span className="font-mono">{note.likesCount || 0}</span>
          </button>

          {/* Embedded Image Attachment Status */}
          {note.imageUrls && note.imageUrls.length > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium" title={`${note.imageUrls.length} image(s) embedded`}>
              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{note.imageUrls.length}</span>
            </span>
          )}

          {/* Read Only PDF Attachment Status */}
          {note.pdfUrl && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium" title="Read-only PDF attached">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">PDF</span>
            </span>
          )}
        </div>

        {/* Author & Timestamp */}
        <div className="text-right flex flex-col items-end max-w-[120px]">
          <span className="text-[11px] font-medium text-slate-700 truncate w-full">
            {note.authorName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {formattedDate()}
          </span>
        </div>
      </div>
    </div>
  );
}
