import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, RotateCcw, AlertTriangle, File, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { fileService } from "../services/fileService";
import { useToast } from "../context/ToastContext";
import { cn } from "../utils/cn";
import { formatFileSize, safeFormat, timeAgo } from "../utils/dateUtils";

export const TrashPage = () => {
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchTrash = async () => {
    try {
      const data = await fileService.getTrash();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load trash");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (file) => {
    try {
      await fileService.restoreFile(file.id);
      toast.success("File restored");
      fetchTrash();
    } catch (err) {
      toast.error("Restore failed");
    }
  };

  const handlePermanentDelete = async (file) => {
    try {
      await fileService.permanentDelete(file.id);
      toast.success("File permanently deleted");
      setConfirmDelete(null);
      fetchTrash();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="w-5 h-5 text-on-surface-variant" />;
    if (type.includes("image")) return <ImageIcon className="w-5 h-5 text-on-surface-variant" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-on-surface-variant" />;
    return <File className="w-5 h-5 text-on-surface-variant" />;
  };

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            Purge Sector <Trash2 className="w-6 h-6 text-error opacity-50" />
          </h1>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">{files.length} item{files.length !== 1 ? 's' : ''} in trash</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Trash2 className="w-24 h-24 mb-6" />
          <h3 className="text-xl font-black font-manrope uppercase tracking-widest">Purge Sector Empty</h3>
          <p className="text-sm font-bold mt-2">Deleted files will appear here.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b ghost-border text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 bg-surface-container-low/30">
                <th className="py-5 px-6 w-[40%]">File</th>
                <th className="py-5 px-6 hidden md:table-cell">Size</th>
                <th className="py-5 px-6 hidden lg:table-cell">Deleted</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="group border-b ghost-border last:border-0 hover:bg-error/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <span className="text-sm font-bold text-on-surface-variant line-through opacity-60 truncate max-w-[200px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden md:table-cell">{formatFileSize(file.fileSize)}</td>
                  <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden lg:table-cell">{timeAgo(file.deletedAt)}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleRestore(file)}
                        className="px-4 py-1.5 bg-tertiary/10 text-tertiary text-[10px] font-black uppercase rounded-lg hover:bg-tertiary/20 transition-all flex items-center gap-1.5">
                        <RotateCcw className="w-3 h-3" /> Restore
                      </button>
                      {confirmDelete === file.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handlePermanentDelete(file)}
                            className="px-3 py-1.5 bg-error text-white text-[10px] font-black uppercase rounded-lg">Delete</button>
                          <button onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 bg-surface-container text-[10px] font-black uppercase rounded-lg">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDelete(file.id)}
                          className="px-4 py-1.5 bg-error/10 text-error text-[10px] font-black uppercase rounded-lg hover:bg-error/20 transition-all flex items-center gap-1.5">
                          <Trash2 className="w-3 h-3" /> Purge
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
