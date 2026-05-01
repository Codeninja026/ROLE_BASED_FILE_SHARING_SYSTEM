import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Maximize2, FileText, ImageIcon, Music, Video, FileCode, ExternalLink } from 'lucide-react';
import { fileService } from '../../services/fileService';

export const FilePreviewModal = ({ file, isOpen, onClose }) => {
  if (!file) return null;

  const getPreviewContent = () => {
    const mime = file.mimeType?.toLowerCase() || '';
    const ext = file.extension?.toLowerCase() || '';
    const fileUrl = `${import.meta.env.VITE_API_URL}/files/download/${file.id}`;

    // Images
    if (mime.startsWith('image/')) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 lg:p-12">
          <img 
            src={fileUrl} 
            alt={file.originalName} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      );
    }

    // PDF
    if (mime.includes('pdf')) {
      return (
        <iframe 
          src={`${fileUrl}#toolbar=0`} 
          className="w-full h-full rounded-b-2xl border-none"
          title={file.originalName}
        />
      );
    }

    // Video
    if (mime.startsWith('video/')) {
      return (
        <div className="flex items-center justify-center h-full bg-black/50">
          <video controls className="max-w-full max-h-full shadow-2xl">
            <source src={fileUrl} type={file.mimeType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio
    if (mime.startsWith('audio/')) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <div className="p-12 bg-primary/10 rounded-full">
            <Music className="w-24 h-24 text-primary" />
          </div>
          <audio controls className="w-full max-w-md">
            <source src={fileUrl} type={file.mimeType} />
          </audio>
        </div>
      );
    }

    // Special Case: IPYNB (Google Colab)
    if (ext === 'ipynb') {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
          <FileCode className="w-24 h-24 text-primary opacity-50" />
          <h3 className="text-xl font-bold">Jupyter Notebook detected</h3>
          <p className="text-on-surface-variant max-w-md">
            Notebooks are best viewed in Google Colab.
          </p>
          <a 
            href={`https://colab.research.google.com/github/googlecolab/colabtools/blob/master/notebooks/colab-github-demo.ipynb`} // Generic Colab redirect for now
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:scale-105 transition-transform"
          >
            <ExternalLink className="w-5 h-5" />
            Open in Google Colab
          </a>
        </div>
      );
    }

    // fallback for documents / code
    const isDoc = mime.includes('word') || mime.includes('sheet') || mime.includes('presentation');
    
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
        {isDoc ? <FileText className="w-24 h-24 text-primary opacity-50" /> : <FileCode className="w-24 h-24 text-primary opacity-50" />}
        <div>
          <h3 className="text-xl font-bold">{file.originalName}</h3>
          <p className="text-on-surface-variant mt-2 uppercase text-xs font-black tracking-widest">{file.extension}</p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
           <button 
            onClick={() => fileService.downloadFile(file.id, file.originalName)}
            className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-xl font-bold hover:bg-surface-container-high transition-colors"
          >
            <Download className="w-5 h-5" />
            Download to View
          </button>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 lg:p-12"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full h-full max-w-7xl bg-surface-container-lowest rounded-2xl border ghost-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b ghost-border shrink-0 bg-surface-container-lowest z-10">
              <div className="flex items-center gap-4 min-w-0">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="truncate">
                  <h4 className="font-bold truncate text-on-surface">{file.originalName}</h4>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                    {Math.round(file.fileSize / 1024)} KB • {file.mimeType}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => fileService.downloadFile(file.id, file.originalName)}
                  className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                <div className="w-px h-6 bg-outline-variant/20 mx-1" />
                <button 
                  onClick={onClose}
                  className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {getPreviewContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
