import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, deleteDoc, where } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth, loginWithGoogle, logoutUser, handleFirestoreError, OperationType } from './firebase';
import { Note, Comment, NoteCategory, CATEGORIES } from './types';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import NoteCard from './components/NoteCard';
import ShareNoteModal from './components/ShareNoteModal';
import NoteDetailsModal from './components/NoteDetailsModal';
import AboutUsModal from './components/AboutUsModal';
import ProfileDashboard from './components/ProfileDashboard';
import { BookOpen, Database, Plus, Search, Trash2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const ADMIN_EMAILS = ['apibhan@gmail.com', 'saradbhandari146@gmail.com'];

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  useEffect(() => {
    const root = document.documentElement;
    if (dark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [dark]);
  return [dark, () => setDark(d => !d)] as const;
}

const SEED_DATA_PACKETS = [
  {
    title: 'Loksewa Civil Sub-Engineer Past Solutions',
    description: 'A complete compile of real past papers for civil sub-engineer PSC exams.',
    category: 'loksewa' as NoteCategory,
    subcategory: 'Syllabus & Past Qs',
    content: '--- RECENT EXAM MCQS CIVIL SUB-ENGINEER ---\n\nQ1: The standard format size of A0 plotting paper in mm is?\nAns: 841 x 1189 mm\n...',
    pdfUrl: 'https://www.orimi.com/pdf-test.pdf',
    imageUrls: ['https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&q=80']
  }
];

export default function App() {
  const [dark, toggleDark] = useDarkMode();
  const [user, setUser] = useState<User | null>(null);
  const [customProfileUser, setCustomProfileUser] = useState<{ uid: string; displayName: string } | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isBooting, setIsBooting] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsBooting(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const notesRef = collection(db, 'notes');
    let unsubscribeApproved = () => {};
    let unsubscribeMyNotes = () => {};

    if (isAdmin) {
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      unsubscribeApproved = onSnapshot(q, (snapshot) => {
        setNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Note)));
      }, (error) => handleFirestoreError(error, OperationType.GET, 'notes'));
    } else {
      let approvedMap: Record<string, Note> = {};
      let myNotesMap: Record<string, Note> = {};
      const merge = () => {
        const combined = { ...approvedMap, ...myNotesMap };
        const sorted = Object.values(combined).sort((a, b) => {
          const tA = a.createdAt?.seconds ?? (a.createdAt ? new Date(a.createdAt).getTime() / 1000 : 0);
          const tB = b.createdAt?.seconds ?? (b.createdAt ? new Date(b.createdAt).getTime() / 1000 : 0);
          return tB - tA;
        });
        setNotes(sorted);
      };
      const qApproved = query(notesRef, where('isApproved', '==', true));
      unsubscribeApproved = onSnapshot(qApproved, (snapshot) => {
        approvedMap = {};
        snapshot.docs.forEach(d => { approvedMap[d.id] = { id: d.id, ...d.data() } as Note; });
        merge();
      }, (error) => handleFirestoreError(error, OperationType.GET, 'notes/approved'));
      if (user?.uid) {
        const qMine = query(notesRef, where('userId', '==', user.uid));
        unsubscribeMyNotes = onSnapshot(qMine, (snapshot) => {
          myNotesMap = {};
          snapshot.docs.forEach(d => { myNotesMap[d.id] = { id: d.id, ...d.data() } as Note; });
          merge();
        }, (error) => handleFirestoreError(error, OperationType.GET, `notes/user-${user.uid}`));
      } else { myNotesMap = {}; merge(); }
    }
    return () => { unsubscribeApproved(); unsubscribeMyNotes(); };
  }, [user, isAdmin]);

  useEffect(() => {
    if (!selectedNote) { setComments([]); return; }
    const q = query(collection(db, 'notes', selectedNote.id, 'comments'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `notes/${selectedNote.id}/comments`));
    return () => unsub();
  }, [selectedNote]);

  const handleAutoSeed = async () => {
    if (notes.length > 0) return;
    try {
      const col = collection(db, 'notes');
      for (const item of SEED_DATA_PACKETS) {
        await addDoc(col, stripUndefined({
          ...item,
          authorName: user?.displayName || 'Sarad Sapkota',
          authorEmail: user?.email || 'saradhelp@gmail.com',
          userId: user?.uid || 'system_seeder_007',
          likesCount: 0, likes: {}, isApproved: true,
          tags: ['Reference Notes', 'Syllabus Guides'],
          createdAt: serverTimestamp()
        }));
      }
    } catch (err) { console.error('Seed failed:', err); }
  };

  const handleLogin = async () => { try { await loginWithGoogle(); } catch (err) { console.error(err); } };
  const handleLogout = async () => {
    try { await logoutUser(); setIsDetailsModalOpen(false); setSelectedNote(null); setIsProfileOpen(false); setCustomProfileUser(null); }
    catch (err) { console.error(err); }
  };
  const handleShareClick = () => { if (!user) { handleLogin(); return; } setIsShareModalOpen(true); };

  const handleShareNote = async (noteData: any) => {
    if (!user) { alert('Please sign in first.'); return; }
    try {
      await addDoc(collection(db, 'notes'), stripUndefined({
        ...noteData, likesCount: 0, likes: {}, isApproved: isAdmin,
        authorName: user.displayName || 'Contributor',
        authorEmail: user.email || '', userId: user.uid, createdAt: serverTimestamp()
      }));
      if (!isAdmin) alert('Submitted! Your material is under review.');
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, 'notes'); }
  };

  const handleApproveNote = async (noteId: string) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), { isApproved: true });
      if (selectedNote?.id === noteId) setSelectedNote({ ...selectedNote, isApproved: true });
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `notes/${noteId}`); }
  };

  const handleAdminDeleteNote = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
      setIsDetailsModalOpen(false); setSelectedNote(null);
    } catch (error) { handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`); }
  };

  const handleLikeNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!user) { alert('Sign in to like materials!'); return; }
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const alreadyLiked = note.likes?.[user.uid] === true;
    const noteRef = doc(db, 'notes', noteId);
    try {
      if (alreadyLiked) {
        await updateDoc(noteRef, { likesCount: Math.max(0, (note.likesCount ?? 0) - 1), [`likes.${user.uid}`]: false });
        if (selectedNote?.id === noteId) setSelectedNote(prev => prev ? { ...prev, likesCount: Math.max(0, (prev.likesCount ?? 0) - 1), likes: { ...prev.likes, [user.uid]: false } } : prev);
      } else {
        await updateDoc(noteRef, { likesCount: (note.likesCount ?? 0) + 1, [`likes.${user.uid}`]: true });
        if (selectedNote?.id === noteId) setSelectedNote(prev => prev ? { ...prev, likesCount: (prev.likesCount ?? 0) + 1, likes: { ...prev.likes, [user.uid]: true } } : prev);
      }
    } catch (error) { handleFirestoreError(error, OperationType.UPDATE, `notes/${noteId}`); }
  };

  const handleAddComment = async (commentText: string) => {
    if (!user || !selectedNote) return;
    try {
      await addDoc(collection(db, 'notes', selectedNote.id, 'comments'), {
        authorName: user.displayName || 'Civil Aspirant',
        userId: user.uid, text: commentText, createdAt: serverTimestamp()
      });
    } catch (error) { handleFirestoreError(error, OperationType.CREATE, `notes/${selectedNote.id}/comments`); }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedNote || !user) return;
    try { await deleteDoc(doc(db, 'notes', selectedNote.id, 'comments', commentId)); }
    catch (error) { handleFirestoreError(error, OperationType.DELETE, `notes/${selectedNote.id}/comments/${commentId}`); }
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Delete this note permanently?')) return;
    try { await deleteDoc(doc(db, 'notes', noteId)); }
    catch (error) { handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`); }
  };

  const handleOpenNoteDetails = (note: Note) => { setSelectedNote(note); setIsDetailsModalOpen(true); };

  const handleViewPosterProfile = (userId: string, authorName: string) => {
    setCustomProfileUser({ uid: userId, displayName: authorName });
    setIsDetailsModalOpen(false);
    setIsProfileOpen(true);
  };

  const activeCategorySpec = selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory) : null;
  const activeSubcategoryList = activeCategorySpec?.subcategories ?? [];

  const filteredNotes = notes.filter(note => {
    if (isAdmin) {
      if (adminStatusFilter === 'approved' && !note.isApproved) return false;
      if (adminStatusFilter === 'pending' && note.isApproved) return false;
    }
    if (selectedCategory !== 'all' && note.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'All Subcategories' && note.subcategory !== selectedSubcategory) return false;
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.description.toLowerCase().includes(q) ||
      note.subcategory.toLowerCase().includes(q) ||
      note.tags?.some(t => t.toLowerCase().includes(q)) ||
      note.content?.toLowerCase().includes(q)
    );
  });

  if (isBooting) return <LoadingScreen message="Loading Civil Help Material Database..." />;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans flex flex-col justify-between relative selection:bg-zinc-200 dark:selection:bg-zinc-800">

      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShareClick={handleShareClick}
        dark={dark}
        onToggleDark={toggleDark}
        onAboutClick={() => setIsAboutModalOpen(true)}
        onProfileClick={() => { setCustomProfileUser(null); setIsProfileOpen(true); }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full flex flex-col items-center">

        <div className="w-full max-w-2xl text-center pt-20 pb-12 flex flex-col items-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Sarad's Civil Help</h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto">Search open warehouses for BE, NEC License, and Loksewa.</p>
          </div>
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input
              type="text"
              placeholder="Search equations, topics, chapters, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-[0_1px_6px_rgba(0,0,0,0.03)] text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
            />
          </div>
          <div className="pt-2">
            <button onClick={handleShareClick} className="px-6 py-2.5 rounded-md text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors cursor-pointer shadow-sm flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Share Your Study Material
            </button>
          </div>
        </div>

        <div className="w-full max-w-4xl space-y-4 mb-8">
          <div className="flex flex-wrap justify-center items-center gap-1.5 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedSubcategory('All Subcategories'); }}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${selectedCategory === 'all' ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
            >
              All Materials ({notes.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory('All Subcategories'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${selectedCategory === cat.id ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
              >
                <span>{cat.label}</span>
                <span className="opacity-60 text-[10px]">({notes.filter(n => n.category === cat.id).length})</span>
              </button>
            ))}
          </div>
          {selectedCategory !== 'all' && activeSubcategoryList.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1 text-[11px]">
              {activeSubcategoryList.map((sub) => (
                <button key={sub} onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1 rounded transition-all ${selectedSubcategory === sub ? 'text-zinc-900 dark:text-zinc-100 font-semibold bg-zinc-100 dark:bg-zinc-900' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className="w-full max-w-5xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-xs">
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-mono uppercase tracking-wider font-semibold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded">Console</span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Reviewing active student requests and platform integrity.</p>
            </div>
            <div className="flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-md border border-zinc-200 dark:border-zinc-800">
              {(['all', 'approved', 'pending'] as const).map((mode) => (
                <button key={mode} onClick={() => setAdminStatusFilter(mode)}
                  className={`px-3 py-1 rounded text-[10px] uppercase font-medium transition-all ${adminStatusFilter === mode ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500'}`}
                >
                  {mode === 'all' && `All (${notes.length})`}
                  {mode === 'approved' && `Live (${notes.filter(n => n.isApproved).length})`}
                  {mode === 'pending' && `Queue (${notes.filter(n => !n.isApproved).length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {notes.length === 0 && (
          <div className="mb-6">
            <button onClick={handleAutoSeed} className="text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400 flex items-center gap-1.5 border border-dashed border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-md transition-colors">
              <Database className="w-3.5 h-3.5" /> Initialize Sample Data Packets
            </button>
          </div>
        )}

        <div className="w-full max-w-7xl mt-2">
          {filteredNotes.length === 0 ? (
            <div className="py-16 text-center max-w-sm mx-auto space-y-2">
              <div className="w-9 h-9 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">No matched results.</h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div key={note.id} className="relative group/wrapper">
                  <NoteCard note={note} onView={handleOpenNoteDetails} currentUserId={user?.uid ?? null} onLike={handleLikeNote} />
                  {user && note.userId === user.uid && (
                    <button onClick={(e) => handleDeleteNote(note.id, e)}
                      className="absolute bottom-3 right-3 p-1.5 text-zinc-400 hover:text-red-500 transition-all bg-white dark:bg-zinc-900 rounded-md opacity-0 group-hover/wrapper:opacity-100 border border-zinc-200 dark:border-zinc-800 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ShareNoteModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={handleShareNote} />

      <NoteDetailsModal
        note={selectedNote}
        isOpen={isDetailsModalOpen}
        onClose={() => { setIsDetailsModalOpen(false); setSelectedNote(null); }}
        user={user}
        onLogin={handleLogin}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onLike={() => selectedNote && handleLikeNote(selectedNote.id, { stopPropagation: () => {} } as React.MouseEvent)}
        isAdmin={isAdmin}
        onApproveNote={() => selectedNote && handleApproveNote(selectedNote.id)}
        onDeleteNote={() => selectedNote && handleAdminDeleteNote(selectedNote.id)}
        onViewProfile={handleViewPosterProfile}
      />

      <AboutUsModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />

      {isProfileOpen && (customProfileUser || user) && (
        <ProfileDashboard
          isOpen={isProfileOpen}
          onClose={() => { setIsProfileOpen(false); setCustomProfileUser(null); }}
          user={(customProfileUser || user) as User}
          notes={notes}
          onViewNote={handleOpenNoteDetails}
        />
      )}

      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-900 py-6 w-full mt-24 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">Sarad's Civil Help</span>
            <span className="mx-2 text-zinc-200 dark:text-zinc-800">•</span>
            <span className="font-mono text-[10px]">Cloud Infrastructure via Firebase</span>
          </div>
          <span className="font-mono text-[10px] tracking-wider uppercase">DevNep © 2026</span>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}