import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Eye, Star, File, FileText, Image as ImageIcon, Folder } from "lucide-react";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import { safeFormat, formatFileSize } from "../utils/dateUtils";

export const SharedFilesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const [filesData, foldersData] = await Promise.all([
          fileService.getSharedFiles(),
          fileService.getSharedFolders()
        ]);
        const fList = Array.isArray(filesData) ? filesData : [];
        const folList = Array.isArray(foldersData) ? foldersData : [];
        // Add a type marker to help with rendering
        const combined = [
          ...folList.map(f => ({ ...f, isFolder: true })),
          ...fList.map(f => ({ ...f, isFolder: false }))
        ];
        setFiles(combined);
      } catch (err) {
        toast.error("Failed to load shared content");
      } finally {
        setIsLoading(false);
      }
    };
    fetchShared();
  }, []);

  const handleDownload = async (item) => {
    try {
      if (item.isFolder) {
        await fileService.downloadFolder(item.id, item.name);
      } else {
        await fileService.downloadFile(item.id, item.name || item.originalName);
      }
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const getFileIcon = (isFolder, type) => {
    if (isFolder) return <Folder className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />;
    if (!type) return <File className="w-6 h-6 text-primary" />;
    if (type.includes("image")) return <ImageIcon className="w-6 h-6 text-tertiary" />;
    if (type.includes("pdf")) return <FileText className="w-6 h-6 text-error" />;
    return <File className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          Shared Nodes <Share2 className="w-6 h-6 text-secondary opacity-50" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">
          Files shared with you
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card animate-pulse rounded-2xl" />)}
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Share2 className="w-24 h-24 mb-6" />
          <h3 className="text-xl font-black font-manrope uppercase tracking-widest">No Shared Files</h3>
          <p className="text-sm font-bold mt-2">When someone shares a file with you it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, i) => (
            <motion.div
              key={file.isFolder ? `folder-${file.id}` : `file-${file.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-5 flex items-center gap-4 group hover:scale-[1.005] transition-transform"
            >
              <div className="p-3 bg-surface-container rounded-xl shrink-0">{getFileIcon(file.isFolder, file.mimeType)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black truncate">{file.name || file.originalName}</p>
                <p className="text-[10px] font-bold text-on-surface-variant mt-0.5">
                  Shared by <span className="text-primary">{file.ownerName}</span> {file.fileSize ? `• ${formatFileSize(file.fileSize)}` : ''}
                </p>
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant hidden md:block">
                {safeFormat(file.createdAt, 'MMM dd, yyyy')}
              </span>
              <button onClick={() => handleDownload(file)}
                className="p-2.5 hover:bg-primary/10 rounded-xl text-on-surface-variant hover:text-primary transition-all opacity-0 group-hover:opacity-100">
                <Download className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
