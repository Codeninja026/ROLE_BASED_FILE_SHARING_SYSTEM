import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Files, Upload, MoreVertical, Star, Trash2, Share2, Download, Edit3, Eye,
  File, FileText, Image as ImageIcon, Video, Search, Filter, Grid, List,
  FolderPlus, Loader2, Maximize2, Folder as FolderIcon, ChevronRight
} from "lucide-react";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ShareModal } from "../components/files/ShareModal";
import { FilePreviewModal } from "../components/files/FilePreviewModal";
import { Modal } from "../components/ui/Modal";
import { cn } from "../utils/cn";
import { safeFormat } from "../utils/dateUtils";

export const FilesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const currentFolderId = searchParams.get("folder") ? parseInt(searchParams.get("folder")) : null;

  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [renameFile, setRenameFile] = useState(null);
  const [renameName, setRenameName] = useState("");
  
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fileService.getFolderContents(currentFolderId);
      setFolders(data.folders || []);
      setFiles(data.files || []);
      setBreadcrumbs(data.breadcrumbs || []);
    } catch (err) {
      toast.error("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const navigateToFolder = (id) => {
    if (id === null) {
      searchParams.delete("folder");
    } else {
      searchParams.set("folder", id);
    }
    setSearchParams(searchParams);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(true);
    try {
      await fileService.createFolder(newFolderName, currentFolderId);
      toast.success("Folder created");
      setShowNewFolderModal(false);
      setNewFolderName("");
      fetchContent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create folder");
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleUpload = async (e, isFolder = false) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    setIsUploading(true);
    setShowUploadMenu(false);

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const path = isFolder ? file.webkitRelativePath : null;
        
        await fileService.uploadFile(file, currentFolderId, (pct) => {
          setUploadProgress(Math.round((i / fileList.length) * 100 + pct / fileList.length));
        }, path);
      }
      toast.success(`${fileList.length} items uploaded`);
      fetchContent();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleDelete = async (file) => {
    try {
      await fileService.deleteFile(file.id);
      toast.success("Moved to trash");
      fetchContent();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleStar = async (item) => {
    try {
      if (item.mimeType === undefined) {
        await fileService.toggleFolderStar(item.id);
      } else {
        await fileService.toggleStar(item.id);
      }
      fetchContent();
    } catch (err) {
      toast.error("Star toggle failed");
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Delete "${folder.name}" and all its contents?`)) return;
    try {
      await fileService.deleteFolder(folder.id);
      toast.success("Moved to trash");
      fetchContent();
    } catch (err) {
      toast.error("Delete failed");
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

  const handleRename = async () => {
    if (!renameFile || !renameName.trim()) return;
    try {
      if (renameFile.mimeType === undefined) {
        await fileService.renameFolder(renameFile.id, renameName);
      } else {
        await fileService.renameFile(renameFile.id, renameName);
      }
      toast.success("Renamed successfully");
      setRenameFile(null);
      fetchContent();
    } catch (err) {
      toast.error("Rename failed");
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="w-8 h-8 text-primary/40" />;
    if (type.includes("image")) return <ImageIcon className="w-8 h-8 text-secondary" />;
    if (type.includes("pdf")) return <FileText className="w-8 h-8 text-error" />;
    if (type.includes("video")) return <Video className="w-8 h-8 text-primary" />;
    return <File className="w-8 h-8 text-on-surface-variant/40" />;
  };

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const filteredFiles = files.filter(f =>
    (f.name || f.originalName)?.toLowerCase().includes(search.toLowerCase()) ||
    f.ownerName?.toLowerCase().includes(search.toLowerCase())
  );
  const hasVisibleItems = filteredFolders.length > 0 || filteredFiles.length > 0;

  return (
    <div className="flex flex-col h-full bg-background font-inter text-on-surface pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-8 py-8 border-b ghost-border bg-background/50 backdrop-blur-md sticky top-0 z-20 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigateToFolder(null)} className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">My Files</button>
            {breadcrumbs.map((b) => (
              <React.Fragment key={b.id}>
                <ChevronRight className="w-3 h-3 text-on-surface-variant/40" />
                <button onClick={() => navigateToFolder(b.id)} className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors max-w-[100px] truncate">{b.name}</button>
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : "Browse"} 
            <FolderIcon className="w-6 h-6 text-primary opacity-50" />
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input
              type="text" placeholder="Filter current view..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container/50 border ghost-border rounded-xl pl-10 pr-4 py-2 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all w-64 h-11"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-container/50 rounded-xl p-1 border ghost-border text-on-surface-variant font-bold">
            <button onClick={() => setViewMode("list")} className={cn("p-2 rounded-lg transition-all", viewMode === "list" ? "bg-primary text-black" : "hover:bg-surface-container hover:text-on-surface")}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-primary text-black" : "hover:bg-surface-container hover:text-on-surface")}>
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowUploadMenu(!showUploadMenu)}
              disabled={isUploading}
              className="bg-primary text-black font-black rounded-xl px-6 h-11 shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {isUploading ? `${uploadProgress}%` : "Upload"}
            </button>

            <AnimatePresence>
              {showUploadMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-48 glass-card p-2 shadow-2xl z-30"
                >
                  <button 
                    onClick={() => { setShowUploadMenu(false); setShowNewFolderModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tertiary/10 text-on-surface text-xs font-bold transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 text-tertiary" />
                    New Folder
                  </button>
                  <div className="h-px bg-outline-variant/20 my-1 mx-2" />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 text-on-surface text-xs font-bold transition-colors"
                  >
                    <File className="w-4 h-4 text-primary" />
                    Upload Files
                  </button>
                  <button 
                    onClick={() => folderInputRef.current?.click()}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/10 text-on-surface text-xs font-bold transition-colors"
                  >
                    <FolderIcon className="w-4 h-4 text-secondary" />
                    Upload Folder
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 glass-card animate-pulse rounded-2xl bg-surface-container/30" />)}
          </div>
        ) : !hasVisibleItems ? (
          <div className="h-full flex flex-col items-center justify-center py-32 opacity-40">
            <Files className="w-24 h-24 mb-6" />
            <h3 className="text-xl font-black font-manrope uppercase tracking-widest">No Items Found</h3>
            <p className="text-sm font-bold mt-2">{search ? "No files or folders match this filter." : "The location is empty."}</p>
          </div>
        ) : viewMode === "list" ? (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b ghost-border text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 bg-surface-container-low/30">
                  <th className="py-5 px-8 w-[40%]">Name</th>
                  <th className="py-5 px-8 hidden md:table-cell">Size</th>
                  <th className="py-5 px-8 hidden lg:table-cell">Modified</th>
                  <th className="py-5 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Render Folders first */}
                {filteredFolders.map((folder) => (
                  <tr 
                    key={`folder-${folder.id}`} 
                    className="group border-b ghost-border last:border-0 hover:bg-surface-container/30 transition-colors cursor-pointer"
                    onDoubleClick={() => navigateToFolder(folder.id)}
                  >
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-yellow-400/10 rounded-xl">
                          <FolderIcon className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
                        </div>
                        <p className="text-[14px] font-black text-on-surface">{folder.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-8 text-xs font-bold text-on-surface-variant hidden md:table-cell">--</td>
                    <td className="py-4 px-8 text-xs font-bold text-on-surface-variant hidden lg:table-cell uppercase tracking-tighter">
                      {safeFormat(folder.updatedAt, 'MMM dd')}
                    </td>
                    <td className="py-4 px-8 text-right">
                       <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => { e.stopPropagation(); navigateToFolder(folder.id); }} title="Open" className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-colors">
                           <Maximize2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleDownload(folder); }} className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary" title="Download">
                          <Download className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleStar(folder); }} className="p-2 hover:bg-yellow-500/10 rounded-lg text-on-surface-variant hover:text-yellow-400" title="Star">
                          <Star className={cn("w-4 h-4", folder.starred && "fill-yellow-400 text-yellow-400")} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); setShareFile(folder); }} className="p-2 hover:bg-secondary/10 rounded-lg text-on-surface-variant hover:text-secondary" title="Share">
                          <Share2 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); setRenameFile(folder); setRenameName(folder.name); }} className="p-2 hover:bg-tertiary/10 rounded-lg text-on-surface-variant hover:text-tertiary" title="Rename">
                          <Edit3 className="w-4 h-4" />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder); }} title="Delete" className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error transition-colors">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                
                {filteredFiles.map((file) => (
                  <tr 
                    key={`file-${file.id}`} 
                    className="group border-b ghost-border last:border-0 hover:bg-surface-container/30 transition-colors cursor-pointer"
                    onClick={() => setPreviewFile(file)}
                  >
                    <td className="py-4 px-8">
                      <div className="flex items-center gap-4">
                        <div className="scale-75 origin-left">{getFileIcon(file.mimeType)}</div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-on-surface truncate pr-4">{file.originalName || file.name}</p>
                          {file.starred && <span className="text-[10px] text-yellow-500 font-black uppercase flex items-center gap-1 mt-0.5"><Star className="w-2.5 h-2.5 fill-yellow-500" /> Starred</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-8 text-xs font-bold text-on-surface-variant hidden md:table-cell">
                      {((file.fileSize || 0) / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-4 px-8 text-xs font-bold text-on-surface-variant hidden lg:table-cell uppercase tracking-tighter">
                      {safeFormat(file.updatedAt || file.createdAt, 'MMM dd, HH:mm')}
                    </td>
                    <td className="py-4 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => setPreviewFile(file)} className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary" title="Preview">
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDownload(file)} className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStar(file)} className="p-2 hover:bg-yellow-500/10 rounded-lg text-on-surface-variant hover:text-yellow-400" title="Star">
                          <Star className={cn("w-4 h-4", file.starred && "fill-yellow-400 text-yellow-400")} />
                        </button>
                        <button onClick={() => setShareFile(file)} className="p-2 hover:bg-secondary/10 rounded-lg text-on-surface-variant hover:text-secondary" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setRenameFile(file); setRenameName(file.name || file.originalName); }} className="p-2 hover:bg-tertiary/10 rounded-lg text-on-surface-variant hover:text-tertiary" title="Rename">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(file)} className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {/* Render Folders */}
            {filteredFolders.map((f) => (
              <div key={`folder-grid-${f.id}`} 
                onDoubleClick={() => navigateToFolder(f.id)}
                className="glass-card p-6 group hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden relative"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-yellow-400/10 rounded-3xl group-hover:bg-yellow-400/20 transition-colors">
                    <FolderIcon className="w-10 h-10 text-yellow-400 fill-yellow-400/20" />
                  </div>
                </div>
                <p className="text-[13px] font-black truncate text-center">{f.name}</p>
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setShareFile(f)} className="p-1.5 bg-background shadow hover:bg-secondary/10 rounded-lg"><Share2 className="w-3 h-3 text-secondary" /></button>
                  <button onClick={() => handleDownload(f)} className="p-1.5 bg-background shadow hover:bg-primary/10 rounded-lg"><Download className="w-3 h-3 text-primary" /></button>
                  <button onClick={() => handleStar(f)} className="p-1.5 bg-background shadow hover:bg-yellow-500/10 rounded-lg"><Star className={cn("w-3 h-3", f.starred ? "fill-yellow-400 text-yellow-400" : "text-on-surface-variant")} /></button>
                  <button onClick={() => { setRenameFile(f); setRenameName(f.name); }} className="p-1.5 bg-background shadow hover:bg-tertiary/10 rounded-lg"><Edit3 className="w-3 h-3 text-tertiary" /></button>
                  <button onClick={() => handleDeleteFolder(f)} className="p-1.5 bg-background shadow hover:bg-error/10 rounded-lg"><Trash2 className="w-3 h-3 text-error" /></button>
                </div>
              </div>
            ))}

            {filteredFiles.map((file) => (
              <div 
                key={`file-grid-${file.id}`} 
                className="glass-card p-6 group hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => setPreviewFile(file)}
              >
                <div className="flex justify-center mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                  {getFileIcon(file.mimeType)}
                </div>
                <p className="text-[13px] font-black truncate text-center">{file.originalName || file.name}</p>
                <p className="text-[10px] font-bold text-on-surface-variant text-center mt-1">
                  {((file.fileSize || 0) / (1024 * 1024)).toFixed(1)} MB
                </p>
                <div className="flex items-center justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleDownload(file)} className="p-1.5 hover:bg-primary/10 rounded-lg"><Download className="w-3.5 h-3.5 text-primary" /></button>
                  <button onClick={() => handleStar(file)} className="p-1.5 hover:bg-yellow-500/10 rounded-lg"><Star className={cn("w-3.5 h-3.5", file.starred ? "fill-yellow-400 text-yellow-400" : "text-on-surface-variant")} /></button>
                  <button onClick={() => setShareFile(file)} className="p-1.5 hover:bg-secondary/10 rounded-lg"><Share2 className="w-3.5 h-3.5 text-secondary" /></button>
                  <button onClick={() => handleDelete(file)} className="p-1.5 hover:bg-error/10 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-error" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal isOpen={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} />

      {/* Share Modal */}
      <ShareModal isOpen={!!shareFile} onClose={() => { setShareFile(null); fetchContent(); }} file={shareFile} />

      {/* Rename Modal */}
      <Modal isOpen={!!renameFile} onClose={() => setRenameFile(null)} title={renameFile?.mimeType === undefined ? "Rename Folder" : "Rename File"}>
        <div className="space-y-4 p-2">
          <input
            value={renameName} onChange={(e) => setRenameName(e.target.value)}
            className="w-full h-14 bg-surface-container border ghost-border rounded-xl px-5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="New filename"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
          <div className="flex gap-3">
            <button onClick={handleRename} className="flex-1 h-12 bg-primary text-black font-black rounded-xl hover:scale-105 transition-transform">Rename</button>
            <button onClick={() => setRenameFile(null)} className="h-12 px-6 bg-surface-container font-black rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Hidden Global Inputs */}
      <input ref={fileInputRef} type="file" multiple onChange={(e) => handleUpload(e, false)} className="hidden" />
      <input 
        ref={folderInputRef} 
        type="file" 
        webkitdirectory="" 
        directory="" 
        multiple 
        onChange={(e) => handleUpload(e, true)} 
        className="hidden" 
      />

      {/* New Folder Modal */}
      <Modal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} title="New Folder">
        <form onSubmit={handleCreateFolder} className="space-y-4 p-2">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Name your subdirectory</p>
          <input
            value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full h-14 bg-surface-container border ghost-border rounded-xl px-5 text-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Folder name"
            autoFocus
          />
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isCreatingFolder} className="flex-1 h-12 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all disabled:opacity-50">
              {isCreatingFolder ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Folder"}
            </button>
            <button type="button" onClick={() => setShowNewFolderModal(false)} className="h-12 px-6 bg-surface-container font-black rounded-xl">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
