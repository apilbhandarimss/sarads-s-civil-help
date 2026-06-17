import React from 'react';
import { X, Globe, Mail } from 'lucide-react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutUsModal({ isOpen, onClose }: AboutUsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Flat Overlay */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col space-y-5">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">About the Platform</h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">The vision behind Sarad's Civil Help</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Founder Context Area */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Founder Image Container */}
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
            <img 
              src="https://i.imgur.com/poGVYNr.png" 
              alt="Sarad Bhandari" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Sarad+Bhandari&background=random';
              }}
            />
          </div>

          {/* Profile & Initiative Descriptions */}
          <div className="space-y-2 text-center sm:text-left">
            <div>
              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sarad Bhandari</h4>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">Founder & Coordinator</span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Started as an engineering initiative, this database provides standardized open access to engineering materials, board solutions, licensing syllabi, and public commission frameworks for aspiring engineers across Nepal.
            </p>
          </div>
        </div>

        {/* Additional Initiative Info */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300 block mb-0.5">Our Mission</span>
          To build an organized, crowd-sourced digital registry where junior and senior peers securely distribute valid reference materials, removing constraints to architectural and structural exam tooling resources.
        </div>

        {/* Close Button Trigger Bar */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex gap-2">
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"><Globe className="w-3.5 h-3.5" /> Web</span>
            <span className="hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 cursor-pointer"><Mail className="w-3.5 h-3.5" /> Contact</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded font-medium transition-colors cursor-pointer"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}