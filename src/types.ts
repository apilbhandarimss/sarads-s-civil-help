export type NoteCategory = 'loksewa' | 'license' | 'bachelors' | 'entrance' | 'masters';

export interface Note {
  id: string;
  title: string;
  description: string;
  category: NoteCategory;
  subcategory: string;
  content?: string;
  imageUrls?: string[];
  pdfUrl?: string;
  authorName: string;
  authorEmail: string;
  userId: string;
  createdAt: any; // Firestore Timestamp or string representation
  likesCount: number;
  likes?: Record<string, boolean>;
  isApproved: boolean; // Admin approval flag
  tags?: string[]; // Tag list
}

export interface Comment {
  id: string;
  authorName: string;
  userId: string;
  text: string;
  createdAt: any;
}

export interface CategorySpec {
  id: NoteCategory;
  label: string;
  description: string;
  subcategories: string[];
  color: string;
}

export const CATEGORIES: CategorySpec[] = [
  {
    id: 'loksewa',
    label: 'Loksewa Preparation',
    description: 'study materials for civil engineering public service commission (PSC) exams, sub-engineer, and engineer levels.',
    subcategories: [
      'All Subcategories',
      'Surveying & Levelling',
      'Building Materials & Construction',
      'Structural Engineering',
      'Water Supply & Sanitary',
      'Irrigation Engineering',
      'Highway Engineering',
      'Estimating & Costing',
      'Syllabus & Past Qs',
      'General MCQs'
    ],
    color: 'emerald'
  },
  {
    id: 'license',
    label: 'NEC License Exams',
    description: 'Nepal Engineering Council licensing prep resources, official syllabus, civil license past question papers, and trial tests.',
    subcategories: [
      'All Subcategories',
      'Official NEC Syllabus',
      'Past Questions',
      'Practice Sets & Test series',
      'Short Explanatory Notes',
      'Books'
    ],
    color: 'amber'
  },
  {
    id: 'bachelors',
    label: 'Bachelors Study Materials',
    description: 'Syllabus, semester notes, tutorial solutions, reference books, and lab manuals for B.E. Civil Engineering.',
    subcategories: [
      'All Subcategories',
      'Semester 1 & 2',
      'Semester 3 & 4',
      'Semester 5 & 6',
      'Semester 7 & 8',
      'Lab Manuals',
      'Reference Textbooks',
      'Drawing & Graphical Sheets'
    ],
    color: 'blue'
  },
  {
    id: 'entrance',
    label: 'B.E. Entrance Materials',
    description: 'Entrance exam preparation sets, physics, chemistries, maths, and drawing guides for IOE/TU/KU entrance aspirants.',
    subcategories: [
      'All Subcategories',
      'Mathematics MCQ Prep',
      'Physics Theory & Formulas',
      'Chemistry Practice Qs',
      'Engineering Drawing Basics',
      'Mock Exam Papers (IOE)',
      'Subcategory Guides'
    ],
    color: 'violet'
  },
  {
    id: 'masters',
    label: 'Masters M.Sc. Entrance',
    description: 'M.Sc. structural, water resources, transportation, geotechnical, and environmental engineering entrance exam preparation.',
    subcategories: [
      'All Subcategories',
      'Structural Analysis MCQs',
      'Geotechnical Engineering Notes',
      'Hydraulics & Hydrology Prep',
      'Transportation & Highway Prep',
      'Syllabus & Past Papers'
    ],
    color: 'rose'
  }
];
