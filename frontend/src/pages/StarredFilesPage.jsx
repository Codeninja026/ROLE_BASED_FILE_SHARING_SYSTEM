import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Download, File, FileText, Image as ImageIcon, Loader2, Folder as FolderIcon } from "lucide-react";
import { fileService } from "../services/fileService";
import { useToast } from "../context/ToastContext";
import { formatFileSize, safeFormat } from "../utils/dateUtils";

export const StarredFilesPage = () => {
  const toast = useToast();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStarred = async () => {
    try {
      const data = await fileService.getStarred();
      console.log('Starred data received:', data);
      // Handle both new object structure and old array structure
      if (Array.isArray(data)) {
        console.log('Data is array, setting as files');
        setFiles(data);
        setFolders([]);
      } else if (data && typeof data === 'object') {
        console.log('Data is object. Folders:', data.folders, 'Files:', data.files);
        setFolders(data.folders || []);
        setFiles(data.files || []);
      } else {
        console.log('Data is neither array nor object:', data);
        setFolders([]);
        setFiles([]);
      }
    } catch (err) {
      console.error('Error fetching starred:', err);
      toast.error("Failed to load starred items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchStarred(); }, []);

  const handleUnstar = async (item) => {
    try {
      if (item.mimeType === undefined) {
        await fileService.toggleFolderStar(item.id);
      } else {
        await fileService.toggleStar(item.id);
      }
      fetchStarred();
    } catch (err) {
      toast.error("Failed to update star");
    }
  };

  const handleDownload = async (item) => {
    try {
      if (item.mimeType === undefined) {
        await fileService.downloadFolder(item.id, item.name);
      } else {
        await fileService.downloadFile(item.id, item.name || item.originalName);
      }
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="w-6 h-6 text-primary" />;
    if (type.includes("image")) return <ImageIcon className="w-6 h-6 text-tertiary" />;
    if (type.includes("pdf")) return <FileText className="w-6 h-6 text-error" />;
    return <File className="w-6 h-6 text-primary" />;
  };

  const hasItems = folders.length > 0 || files.length > 0;

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div>
        <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
          Starred <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 opacity-80" />
        </h1>
        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">
          {folders.length + files.length} starred item{folders.length + files.length !== 1 ? 's' : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !hasItems ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Star className="w-24 h-24 mb-6" />
          <h3 className="text-xl font-black font-manrope uppercase tracking-widest">No Starred Items</h3>
          <p className="text-sm font-bold mt-2">Star important files and folders for quick access.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Folders */}
          {Array.isArray(folders) && folders.map((folder, i) => (
            <motion.div key={`folder-${folder.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass-card p-6 group hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                  <FolderIcon className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{folder.name}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Folder • {(folder.fileCount || 0) + (folder.subFolderCount || 0)} items</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{safeFormat(folder.createdAt, 'MMM dd, yyyy')}</p>
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDownload(folder)} className="flex-1 py-2 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition-colors">Download Zip</button>
                <button onClick={() => handleUnstar(folder)} className="py-2 px-3 bg-yellow-400/10 text-yellow-400 text-xs font-black rounded-lg hover:bg-yellow-400/20 transition-colors">Unstar</button>
              </div>
            </motion.div>
          ))}

          {/* Files */}
          {Array.isArray(files) && files.map((file, i) => (
            <motion.div key={`file-${file.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (folders.length + i) * 0.03 }}
              className="glass-card p-6 group hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 bg-surface-container rounded-lg">{getFileIcon(file.mimeType)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate">{file.name || file.originalName}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{formatFileSize(file.fileSize)} • File</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">{safeFormat(file.createdAt, 'MMM dd, yyyy')}</p>
              <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDownload(file)} className="flex-1 py-2 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition-colors">Download</button>
                <button onClick={() => handleUnstar(file)} className="py-2 px-3 bg-yellow-400/10 text-yellow-400 text-xs font-black rounded-lg hover:bg-yellow-400/20 transition-colors">Unstar</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
