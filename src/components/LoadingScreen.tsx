import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading engineering resources...' }: { message?: string }) {
  return (
    <div id="loading-container" className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center z-50 p-6">
      <div className="flex flex-col items-center max-w-sm text-center">
        {/* Engineering Drafting/Compass Pulsating Icon */}
        <motion.div
          id="loading-logo"
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-sm mb-6"
        >
          <Compass className="w-8 h-8" />
        </motion.div>

        {/* Brand Typography */}
        <motion.h1
          id="loading-brand-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display text-2xl font-bold tracking-tight text-slate-900"
        >
          Sarads's Civil Help
        </motion.h1>

        <motion.p
          id="loading-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest"
        >
          Civil Engineering Portal
        </motion.p>

        {/* Loading Bar Indicator */}
        <div id="loading-progress-track" className="w-48 h-1 bg-slate-200 rounded-full mt-8 overflow-hidden">
          <motion.div
            id="loading-progress-bar"
            animate={{
              x: [-192, 192],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.8,
              ease: "easeInOut",
            }}
            className="w-full h-full bg-slate-900 rounded-full"
          />
        </div>

        <motion.p
          id="loading-status-message"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-sm text-slate-600 mt-4 font-sans font-medium"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
