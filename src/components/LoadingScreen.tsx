import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading engineering resources...' }: { message?: string }) {
  return (
    <div
      id="loading-container"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 p-6 bg-white dark:bg-zinc-950"
    >
      <div className="flex flex-col items-center max-w-sm text-center">
        <motion.div
          id="loading-logo"
          animate={{ scale: [1, 1.08, 1], rotate: [0, 15, -15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 bg-zinc-900 dark:bg-zinc-100 rounded-xl flex items-center justify-center mb-6 shadow-sm"
        >
          <Compass className="w-7 h-7 text-white dark:text-zinc-900" />
        </motion.div>

        <motion.h1
          id="loading-brand-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Sarad's Civil Help
        </motion.h1>

        <motion.p
          id="loading-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1 uppercase tracking-widest"
        >
          Civil Engineering Portal
        </motion.p>

        <div
          id="loading-progress-track"
          className="w-40 h-[2px] bg-zinc-100 dark:bg-zinc-800 rounded-full mt-8 overflow-hidden"
        >
          <motion.div
            id="loading-progress-bar"
            animate={{ x: [-160, 160] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-full h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
          />
        </div>

        <motion.p
          id="loading-status-message"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="text-xs text-zinc-500 dark:text-zinc-400 mt-4"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}