import React from 'react';
import { FileText, Heart, Image as ImageIcon } from 'lucide-react';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onView: (note: Note) => void;
  currentUserId: string | null;
  onLike: (noteId: string, event: React.MouseEvent) => void;
}

const categoryColors: Record<string, string> = {
  loksewa:   'border-emerald-500/70 text-emerald-600 dark:text-emerald-400',
  license:   'border-amber-500/70 text-amber-600 dark:text-amber-400',
  bachelors: 'border-blue-500/70 text-blue-600 dark:text-blue-400',
  entrance:  'border-violet-500/70 text-violet-600 dark:text-violet-400',
  masters:   'border-rose-500/70 text-rose-600 dark:text-rose-400',
};

export default function NoteCard({ note, onView, currentUserId, onLike }: NoteCardProps) {
  const isLiked = currentUserId ? !!(note.likes && note.likes[currentUserId]) : false;

  const formattedDate = () => {
    if (!note.createdAt) return 'Recent';
    let dateObj: Date;
    if (typeof (note.createdAt as any).toDate === 'function') {
      dateObj = (note.createdAt as any).toDate();
    } else {
      dateObj = new Date(note.createdAt as any);
    }
    return isNaN(dateObj.getTime())
      ? 'Recent'
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeCategoryColor = categoryColors[note.category] || 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400';

  // 90% Transparent Gradient Styles (10% Opacity)
  const glassGradientStyle = {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(168, 85, 247, 0.08) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <div
      onClick={() => onView(note)}
      style={glassGradientStyle}
      className="
        group flex flex-col justify-between p-5 min-h-[220px] cursor-pointer 
        rounded-xl transition-all duration-300
        
        /* Ultra-thin glassy borders */
        border border-white/20 dark:border-purple-500/10
        
        /* Interactive glass lift effect */
        hover:border-white/40 dark:hover:border-purple-400/20
        hover:shadow-[0_12px_30px_rgba(168,85,247,0.04)]
        hover:translate-y-[-2px]
      "
    >
      <div>
        {/* Meta Header */}
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3 text-zinc-500 dark:text-zinc-400">
          <span className={`pl-2 border-l-2 font-medium capitalize ${activeCategoryColor}`}>
            {note.category}
          </span>
          
          {note.subcategory && note.subcategory !== 'All Subcategories' && (
            <>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="truncate max-w-[120px]">{note.subcategory}</span>
            </>
          )}

          {note.isApproved === false && (
            <span className="ml-auto text-[10px] tracking-wider uppercase font-medium text-amber-600 dark:text-amber-400">
              Pending
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 line-clamp-1 transition-colors">
          {note.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-3 leading-relaxed">
          {note.description}
        </p>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {note.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] text-zinc-400 dark:text-zinc-500/80">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-3 mt-4 border-t border-zinc-200/20 dark:border-zinc-800/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Like Button */}
          <button
            onClick={(e) => onLike(note.id, e)}
            className={`flex items-center gap-1.5 py-1 px-2 rounded-md transition-all ${
              isLiked
                ? 'text-red-500 bg-red-50/50 dark:bg-red-500/10'
                : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-medium">{note.likesCount || 0}</span>
          </button>

          {/* Attachments */}
          <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
            {note.imageUrls && note.imageUrls.length > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                <span className="text-[11px]">{note.imageUrls.length}</span>
              </div>
            )}
            {note.pdfUrl && <FileText className="w-3 h-3" />}
          </div>
        </div>

        {/* Author / Date Info */}
        <div className="text-right text-[11px]">
          <span className="block font-medium text-zinc-600 dark:text-zinc-400 truncate max-w-[100px]">
            {note.authorName}
          </span>
          <span className="block text-zinc-400 dark:text-zinc-500 text-[10px] mt-0.5">
            {formattedDate()}
          </span>
        </div>
      </div>
    </div>
  );
}