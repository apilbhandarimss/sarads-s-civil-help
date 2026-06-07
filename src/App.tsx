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
import {
  BookOpen,
  Compass,
  FileText,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Award,
  ChevronRight,
  Database,
  Trash2
} from 'lucide-react';

const SEED_DATA_PACKETS = [
  {
    title: 'Loksewa Civil Sub-Engineer Past Solutions',
    description: 'A complete compile of real past papers for civil sub-engineer PSC exams. Includes 50 MCQs on structural design, estimating, and public procurement guides.',
    category: 'loksewa' as NoteCategory,
    subcategory: 'Syllabus & Past Qs',
    content: '--- RECENT EXAM MCQS CIVIL SUB-ENGINEER ---\n\nQ1: The standard format size of A0 plotting paper in mm is?\nAns: 841 x 1189 mm\n\nQ2: The concrete mix generally used for standard reinforced concrete columns is?\nAns: M20 or rich mix\n\nQ3: In a simple vertical brick wall curve, what is the key tension check?\nAns: Compressive strength ratio must not cross critical loads.\n\nQ4: What is the primary purpose of adding gypsum during Portland cement manufacturing?\nAns: To adjust the setting time of cement (retarder).',
    pdfUrl: 'https://www.orimi.com/pdf-test.pdf', // read-only safe pdf mock url
    imageUrls: [
      'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
    ]
  },
  {
    title: 'NEC Civil License Structural Analysis Cheat Sheet',
    description: 'Quick reference formulas and beam reaction diagrams specifically formatted for the Nepal Engineering Council licensing exam.',
    category: 'license' as NoteCategory,
    subcategory: 'Practice Sets & Test series',
    content: '--- STRUCTURAL DEFLECTION AND INDETERMINACY ---\n\n1. Static Indeterminacy (Ds):\n   Ds = R - 3 (For standard beam structures)\n\n2. Fixed Beam deflection with point load P at midpoint:\n   Deflection = PL^3 / (192 * EI)\n\n3. Clapeyron\'s Three Moment Theorem:\n   M_a * L_1 + 2*M_b*(L_1 + L_2) + M_c * L_2 = -6*A_1*a_1/L_1 - 6*A_2*a_2/L_2\n\n4. Shear force slope representation:\n   d2M / dx2 = w (applied load matrix)',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    imageUrls: [
      'https://images.unsplash.com/photo-1581094288338-2314dddb7eed?w=800&q=80'
    ]
  },
  {
    title: 'TU B.E. Civil 4th Semester Fluid Mechanics Syllabus Manual',
    description: 'Syllabus guidelines, textbook references, and lab test formats for Fluid Mechanics (Bachelors Civil Engineering TU schema).',
    category: 'bachelors' as NoteCategory,
    subcategory: 'Semester 3 & 4',
    content: '--- FLUID MECHANICS CRITICAL EXPERIMENTS SYLLABUS ---\n\nLab Experiment 1: Determination of Metacentric Height of a floating vessel.\nLab Experiment 2: Calibration of Rectangular and Triangular Notches (Weirs).\nLab Experiment 3: Verification of Bernoulli\'s Theorem in fluid flowing channel.\nLab Experiment 4: Losses in pipe networks (Friction factor determination).',
    imageUrls: [
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&q=80'
    ]
  },
  {
    title: 'IOE B.E. Entrance Examination Mock Set',
    description: 'Sample entrance exam questions in Mathematics, Physics, and Drawing to score top ranks in Pulchowk campus.',
    category: 'entrance' as NoteCategory,
    subcategory: 'Mock Exam Papers (IOE)',
    content: '--- PART A: Mathematics (2 Marks each) ---\n\nQ1: If x + y + z = log(a + bx), what is the partial derivative with respect to z?\nAns: dy/dz = -1 / (a+b)\n\nQ2: Find the distance between lines 3x + 4y = 8 and 3x + 4y = 18.\nAns: Distance = |18 - 8| / sqrt(3^2 + 4^2) = 10 / 5 = 2 units\n\n--- PART B: Physics ---\n\nQ3: A body weighs 60N on the earth. How much will it weigh on the moon?\nAns: Weight = 60 * (1/6) = 10 Newtons.',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
  },
  {
    title: 'IOE Masters Structural Dynamics Past Guide',
    description: 'Key derivations for M.Sc. engineering entrance exam prep. Dynamic magnification factors, SDOF systems response notes.',
    category: 'masters' as NoteCategory,
    subcategory: 'Structural Analysis MCQs',
    content: '--- SINGLE DEGREE OF FREEDOM (SDOF) RESPONSES ---\n\nEquation of Motion:\n m*u\'\'(t) + c*u\'(t) + k*u(t) = p(t)\n\nWhere:\n - m = structural mass ratio\n - c = damping factor\n - k = structural rigidity/stiffness\n\nNatural Angular Frequency:\n omega_n = sqrt(k / m)\n\nDynamic Magnification Factor (DMF) under harmonic loads:\n DMF = 1 / sqrt( (1 - r^2)^2 + (2*zeta*r)^2 )',
    imageUrls: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80'
    ]
  }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  
  // App UI state
  const [isBooting, setIsBooting] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Admin filter toggling queue
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');

  // Filter queries
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
  const [isFilterTrayOpen, setIsFilterTrayOpen] = useState(false);

  // Authentication Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsBooting(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Notes Realtime from Firestore with secure query rules
  useEffect(() => {
    const notesRef = collection(db, 'notes');
    const isAdmin = user?.email === 'apibhan@gmail.com';

    let unsubscribeApproved = () => {};
    let unsubscribeMyNotes = () => {};

    if (isAdmin) {
      // Admins see EVERYTHING in the pool
      const q = query(notesRef, orderBy('createdAt', 'desc'));
      unsubscribeApproved = onSnapshot(q, (snapshot) => {
        const fetchedNotes: Note[] = [];
        snapshot.forEach((doc) => {
          fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
        });
        setNotes(fetchedNotes);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'notes');
      });
    } else {
      // Standard / Anonymous users: Load approved notes, and their own submissions if signed in
      const qApproved = query(notesRef, where('isApproved', '==', true));
      let approvedMap: Record<string, Note> = {};
      let myNotesMap: Record<string, Note> = {};

      const updateCombinedNotes = () => {
        const combined = { ...approvedMap, ...myNotesMap };
        const finalArray = Object.values(combined).sort((a, b) => {
          const timeA = a.createdAt?.seconds || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.seconds || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        });
        setNotes(finalArray);
      };

      unsubscribeApproved = onSnapshot(qApproved, (snapshot) => {
        approvedMap = {};
        snapshot.forEach((doc) => {
          approvedMap[doc.id] = { id: doc.id, ...doc.data() } as Note;
        });
        updateCombinedNotes();
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'notes/approved');
      });

      if (user?.uid) {
        const qMyNotes = query(notesRef, where('userId', '==', user.uid));
        unsubscribeMyNotes = onSnapshot(qMyNotes, (snapshot) => {
          myNotesMap = {};
          snapshot.forEach((doc) => {
            myNotesMap[doc.id] = { id: doc.id, ...doc.data() } as Note;
          });
          updateCombinedNotes();
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `notes/user-${user.uid}`);
        });
      } else {
        myNotesMap = {};
        updateCombinedNotes();
      }
    }

    return () => {
      unsubscribeApproved();
      unsubscribeMyNotes();
    };
  }, [user]);

  // Fetch comments safely inside subcollection when selectedNote is set
  useEffect(() => {
    if (!selectedNote) {
      setComments([]);
      return;
    }

    const commentsRef = collection(db, 'notes', selectedNote.id, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments: Comment[] = [];
      snapshot.forEach((doc) => {
        fetchedComments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `notes/${selectedNote.id}/comments`);
    });

    return () => unsubscribe();
  }, [selectedNote]);

  // Handle Note Auto-seeding when Database is empty
  const handleAutoSeed = async () => {
    if (notes.length > 0) return;
    
    // Create random mock user credentials or use user info if signed in
    const defaultAuthorName = user?.displayName || 'Sarad Sapkota';
    const defaultAuthorEmail = user?.email || 'saradhelp@gmail.com';
    const defaultUserId = user?.uid || 'system_seeder_007';

    try {
      const notesCol = collection(db, 'notes');
      for (const item of SEED_DATA_PACKETS) {
        await addDoc(notesCol, {
          ...item,
          authorName: defaultAuthorName,
          authorEmail: defaultAuthorEmail,
          userId: defaultUserId,
          likesCount: 0,
          likes: {},
          isApproved: true, // Seeded reference notes are auto-approved for a full product feel!
          tags: ['Reference Notes', 'Syllabus Guides'],
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('Failed to seed DB notes:', err);
    }
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsDetailsModalOpen(false);
      setSelectedNote(null);
    } catch (err) {
      console.error('Logout Exception:', err);
    }
  };

  const handleShareNote = async (noteData: {
    title: string;
    description: string;
    category: NoteCategory;
    subcategory: string;
    content?: string;
    pdfUrl?: string;
    imageUrls?: string[];
    tags?: string[];
  }) => {
    if (!user) {
      alert('You must be signed in to contribute materials!');
      return;
    }

    const isAdminUser = user.email === 'apibhan@gmail.com';

    const itemPayload = {
      ...noteData,
      pdfUrl: noteData.pdfUrl || '', // ✅ DEFAULT TO EMPTY STRING
      imageUrls: noteData.imageUrls || [], // ✅ DEFAULT TO EMPTY ARRAY
      content: noteData.content || '', // ✅ DEFAULT TO EMPTY STRING
      tags: noteData.tags || [], // ✅ DEFAULT TO EMPTY ARRAY
      likesCount: 0,
      likes: {},
      isApproved: isAdminUser,
      authorName: user.displayName || 'Contributor',
      authorEmail: user.email || '',
      userId: user.uid,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'notes'), itemPayload);
      if (!isAdminUser) {
        alert('Thank you! Your civil educational material has been submitted for Moderation. It is currently under review by admin apibhan@gmail.com and will be made public once approved. You can see it marked as "Pending Review" on your personal board.');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notes');
    }
  };

  // Add Comment inside subcollection
  const handleAddComment = async (commentText: string) => {
    if (!user || !selectedNote) return;

    const commentPayload = {
      authorName: user.displayName || 'Civil Aspirant',
      userId: user.uid,
      text: commentText,
      createdAt: serverTimestamp() // strict temporal constraint
    };

    try {
      const commCol = collection(db, 'notes', selectedNote.id, 'comments');
      await addDoc(commCol, commentPayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `notes/${selectedNote.id}/comments`);
    }
  };

  // Delete Comment (Owner or Admin Only)
  const handleDeleteComment = async (commentId: string) => {
    if (!selectedNote || !user) return;
    try {
      const commDocRef = doc(db, 'notes', selectedNote.id, 'comments', commentId);
      await deleteDoc(commDocRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${selectedNote.id}/comments/${commentId}`);
    }
  };

  // Delete Note (Uploader or Admin Only)
  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this study note permanently?')) return;

    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${noteId}`);
    }
  };

  const handleOpenNoteDetails = (note: Note) => {
    setSelectedNote(note);
    setIsDetailsModalOpen(true);
  };

  // Dynamic filter lists
  const activeCategorySpec = selectedCategory !== 'all' ? CATEGORIES.find(c => c.id === selectedCategory) : null;
  const activeSubcategoryList = activeCategorySpec ? activeCategorySpec.subcategories : [];

  // Filter & Search Logic with multi-tag lookup and moderation filter support
  const filteredNotes = notes.filter(note => {
    // Admin review filter status logic
    if (user?.email === 'apibhan@gmail.com') {
      if (adminStatusFilter === 'approved' && !note.isApproved) return false;
      if (adminStatusFilter === 'pending' && note.isApproved) return false;
    }

    const isCategoryMatch = selectedCategory === 'all' || note.category === selectedCategory;
    const isSubcategoryMatch = selectedSubcategory === 'All Subcategories' || note.subcategory === selectedSubcategory;
    
    // text query searches Title, Description, Subcategory, Tags, and Content text
    const textQuery = searchQuery.toLowerCase();
    const matchesTags = note.tags && note.tags.some(tag => tag.toLowerCase().includes(textQuery));
    const isTextMatch = !textQuery || 
      note.title.toLowerCase().includes(textQuery) || 
      note.description.toLowerCase().includes(textQuery) ||
      note.subcategory.toLowerCase().includes(textQuery) ||
      !!matchesTags ||
      (note.content && note.content.toLowerCase().includes(textQuery));

    return isCategoryMatch && isSubcategoryMatch && isTextMatch;
  });

  if (isBooting) {
    return <LoadingScreen message="Loading Civil Help Material Database..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      
      {/* Navbar Widget */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      {/* Main Core Layout Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Intro Portal Banner Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border border-slate-950 relative overflow-hidden">
          <div className="space-y-3 z-10 text-left max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/15 text-slate-300 text-[10px] font-bold font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-slate-100" />
              Civil Peer-to-Peer Hub
            </div>
            <h2 className="font-display text-2xl md:text-3.5xl font-extrabold tracking-tight leading-none text-white">
              Sarads's Civil Help
            </h2>
            <p className="text-sm text-slate-350 leading-relaxed max-w-xl">
              An open, read-only educational warehouse for Civil Loksewa, Nepal licensing exams, pulchowk bachelors semester packets, and masters entrance papers. Real-time diagrams, formulas, solutions, and peer suggestions.
            </p>
          </div>

          <div className="flex gap-3 z-10 flex-shrink-0">
            {/* Share Notes shortcut button */}
            <button
              id="btn-hero-share"
              onClick={() => {
                if (!user) {
                  alert('Please sign in first via the Sign In button at the top!');
                  return;
                }
                setIsShareModalOpen(true);
              }}
              className="bg-white text-slate-900 font-bold text-xs px-4 py-2.5 rounded-lg hover:bg-slate-50 cursor-pointer shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              Share Study Materials
            </button>
          </div>

          {/* Abstract Structural Grid Design Concept (replaces gradients - no useless gradients requested!) */}
          <div className="absolute inset-0 opacity-15 pointer-events-none">
            <svg className="w-full h-full text-slate-400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="structural-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#structural-grid)" />
            </svg>
          </div>
        </div>

        {/* Admin Review Dashboard Strip */}
        {user?.email === 'apibhan@gmail.com' && (
          <div className="bg-amber-50/80 border border-amber-200/80 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-left shadow-2xs">
            <div>
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md">
                Admin Review Console
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-1.5 font-display">
                You are registered as the Platform Moderator.
              </p>
              <p className="text-xs text-slate-550 mt-0.5">
                Manage user-contributed Loksewa and Engineering License material submissions. Only approved items are visible to peers.
              </p>
            </div>
            <div className="flex gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shrink-0">
              {(['all', 'approved', 'pending'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAdminStatusFilter(mode)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase cursor-pointer transition-all ${
                    adminStatusFilter === mode
                      ? 'bg-slate-900 border border-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {mode === 'all' && `All Posts (${notes.length})`}
                  {mode === 'approved' && `Approved (${notes.filter(n => n.isApproved).length})`}
                  {mode === 'pending' && `Approval Queue (${notes.filter(n => !n.isApproved).length})`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories Horizontal Scrolling Filter Row */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
              Browse Material Pillar
            </h3>
            {/* Small Quick Seeder trigger if DB has 0 items */}
            {notes.length === 0 && (
              <button
                id="btn-quick-seed"
                onClick={handleAutoSeed}
                className="text-[10px] font-bold font-mono text-slate-500 hover:text-slate-905 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-all cursor-pointer border border-slate-200"
              >
                <Database className="w-3.5 h-3.5" />
                Seed Reference Notes (Pulchowk, NEC, Loksewa)
              </button>
            )}
          </div>
          
          <div id="category-tabs-track" className="flex overflow-x-auto gap-2 pb-1.5 scrollbar-thin">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('All Subcategories');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              All Categories ({notes.length})
            </button>
            
            {CATEGORIES.map((cat) => {
              const noteCount = notes.filter(n => n.category === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory('All Subcategories');
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-605 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${isSelected ? 'bg-white/10' : 'bg-slate-100 text-slate-500'}`}>
                    {noteCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inner Search & Subcategory tag filtration */}
        <div id="filter-bar" className="bg-white border border-slate-200/80 rounded-xl p-4 gap-4 flex flex-col md:flex-row items-center justify-between">
          
          {/* Real-time search query bounds */}
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={`Search in ${selectedCategory === 'all' ? 'all' : selectedCategory} notes, questions, or formulas...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-slate-350"
            />
          </div>

          {/* Conditional Subcategory Tags selection row */}
          {selectedCategory !== 'all' && (
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto justify-start md:justify-end">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filters:
              </span>
              {activeSubcategoryList.map((sub) => {
                const isSubSelected = selectedSubcategory === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`text-[11px] px-2.5 py-1 rounded-md border font-medium cursor-pointer transition-colors ${
                      isSubSelected
                        ? 'bg-slate-900 border-slate-950 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active notes result status */}
        <div className="text-left py-0.5 flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-widest">
            {filteredNotes.length === 1 ? '1 Material Found' : `${filteredNotes.length} Materials Found`}
          </p>
        </div>

        {/* Dashboard Notes Grid Collection */}
        {filteredNotes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-display font-bold text-slate-800 text-base">No notes or sheets matched.</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              We couldn't locate educational folders on this query. Be the first to share your civil notes or past solutions!
            </p>
            {notes.length === 0 && (
              <button
                onClick={handleAutoSeed}
                className="mt-4 inline-flex items-center gap-2 bg-slate-905 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Apply Seed Civil Materials
              </button>
            )}
          </div>
        ) : (
          <div id="notes-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredNotes.map((note) => (
              <div key={note.id} className="relative group/wrapper">
                <NoteCard
                  note={note}
                  onView={handleOpenNoteDetails}
                  currentUserId={user ? user.uid : null}
                  onLike={handleLikeNote}
                />
                
                {/* Delete direct overlay for Note creator */}
                {user && note.userId === user.uid && (
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="absolute top-3.5 right-3.5 p-1 px-1.5 text-slate-400 hover:text-rose-600 transition-colors bg-white hover:bg-rose-50 border border-slate-100 rounded-md cursor-pointer opacity-0 group-hover/wrapper:opacity-100"
                    title="Delete your material"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Sharing Flow Note Creation Window */}
      <ShareNoteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareNote}
      />

      {/* Study Materials Details document Reader Modal */}
      <NoteDetailsModal
        note={selectedNote}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNote(null);
        }}
        user={user}
        onLogin={handleLogin}
        comments={comments}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onLike={() => selectedNote && handleLikeNote(selectedNote.id, { stopPropagation: () => {} } as any)}
        isAdmin={user?.email === 'apibhan@gmail.com'}
        onApproveNote={() => selectedNote && handleApproveNote(selectedNote.id)}
        onDeleteNote={() => selectedNote && handleAdminDeleteNote(selectedNote.id)}
      />

      {/* Humble Footer info signature */}
      <footer className="bg-white border-t border-slate-150 py-8 w-full mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-xs font-semibold text-slate-850">Sarads's Civil Help</p>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Built securely on Cloud Run with Firestore relational maps</p>
          </div>
          <div className="flex gap-4">
            <span className="text-[11px] text-slate-400">Nepali Civil Engineering Education platform © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
