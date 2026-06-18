import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Note } from '../types';
import { X, ChevronRight } from 'lucide-react';

interface ProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  notes: Note[];
  onViewNote: (note: Note) => void;
}

type Tab = 'uploads' | 'liked';

export default function ProfileDashboard({ isOpen, onClose, user, notes, onViewNote }: ProfileDashboardProps) {
  const [tab, setTab] = useState<Tab>('uploads');

  if (!isOpen) return null;

  const myNotes = notes.filter(n => n.userId === user.uid);
  const likedNotes = notes.filter(n => n.likes?.[user.uid] === true);
  const totalLikesReceived = myNotes.reduce((sum, n) => sum + (n.likesCount ?? 0), 0);
  const approvedNotes = myNotes.filter(n => n.isApproved);
  const pendingNotes = myNotes.filter(n => !n.isApproved);

  const joinedDate = (() => {
    const meta = (user as any).metadata;
    if (!meta?.creationTime) return null;
    return new Date(meta.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  })();

  const formattedDate = (rawDate: any) => {
    if (!rawDate) return '—';
    const dateObj = typeof rawDate.toDate === 'function' ? rawDate.toDate() : new Date(rawDate);
    return isNaN(dateObj.getTime()) ? '—' : dateObj.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const activeList = tab === 'uploads' ? myNotes : likedNotes;

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-md h-[95vh] sm:h-[88vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl">

        {/* ── Cover + Avatar area ── */}
        <div className="relative shrink-0">
          {/* Cover strip */}
          <div className="h-20 bg-zinc-100 dark:bg-zinc-900" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Avatar — overlaps cover */}
          <div className="absolute left-5 bottom-0 translate-y-1/2">
            {user.photoURL ? (
              <img
                referrerPolicy="no-referrer"
                src={user.photoURL}
                alt=""
                className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-zinc-950"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-zinc-300 dark:bg-zinc-700 border-4 border-white dark:border-zinc-950 flex items-center justify-center text-xl font-bold text-zinc-600 dark:text-zinc-300">
                {(user.displayName || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* ── Name / meta row ── */}
        <div className="px-5 pt-10 pb-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{user.displayName || 'Engineer'}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{user.email}</p>
          {joinedDate && (
            <p className="text-[11px] text-zinc-400 dark:text-zinc-600 mt-1">Joined {joinedDate}</p>
          )}

          {/* Stats inline row */}
          <div className="flex items-center gap-5 mt-4">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{myNotes.length}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Uploads</p>
            </div>
            <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{totalLikesReceived}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Likes received</p>
            </div>
            <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{approvedNotes.length}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Published</p>
            </div>
            <div className="w-px h-6 bg-zinc-100 dark:bg-zinc-800" />
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{likedNotes.length}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500">Liked</p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          {(['uploads', 'liked'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium transition-colors relative capitalize ${
                tab === t
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
            >
              {t === 'uploads' ? `Uploads${myNotes.length > 0 ? ` (${myNotes.length})` : ''}` : `Liked${likedNotes.length > 0 ? ` (${likedNotes.length})` : ''}`}
              {tab === t && (
                <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Pending notice — only on uploads tab */}
          {tab === 'uploads' && pendingNotes.length > 0 && (
            <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-lg">
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {pendingNotes.length} note{pendingNotes.length > 1 ? 's' : ''} pending admin review
              </p>
            </div>
          )}

          {activeList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16 gap-2">
              <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                {tab === 'uploads' ? 'No uploads yet' : 'No liked notes yet'}
              </p>
              <p className="text-xs text-zinc-300 dark:text-zinc-700">
                {tab === 'uploads' ? 'Share your study materials to get started.' : 'Like notes to save them here.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {activeList.map(note => (
                <button
                  key={note.id}
                  onClick={() => { onViewNote(note); onClose(); }}
                  className="w-full text-left flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                >
                  {/* Category dot */}
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0 mt-0.5" />

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {note.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                      <span className="capitalize">{note.category.replace('_', ' ')}</span>
                      <span>·</span>
                      {tab === 'uploads' ? (
                        <>
                          <span>{note.likesCount ?? 0} likes</span>
                          <span>·</span>
                          <span>{formattedDate(note.createdAt)}</span>
                          {!note.isApproved && (
                            <>
                              <span>·</span>
                              <span className="text-amber-500 dark:text-amber-400">pending</span>
                            </>
                          )}
                        </>
                      ) : (
                        <span>by {note.authorName}</span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 shrink-0 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}