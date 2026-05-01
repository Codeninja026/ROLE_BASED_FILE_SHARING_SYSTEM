import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative bg-surface-container-highest border ghost-border rounded-3xl shadow-2xl w-full ${maxWidth} z-10 overflow-hidden`}
        >
          {title && (
            <div className="flex items-center justify-between px-8 py-5 border-b ghost-border">
              <h3 className="text-sm font-black uppercase tracking-widest">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-xl text-on-surface-variant hover:text-on-surface transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
