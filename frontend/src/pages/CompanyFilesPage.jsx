import React, { useState, useEffect } from "react";
import { Building2, Download, File, FileText, Image as ImageIcon, Search, Loader2 } from "lucide-react";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { formatFileSize, safeFormat } from "../utils/dateUtils";

export const CompanyFilesPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await fileService.getAllFiles();
        setFiles(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load enterprise files");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [toast]);

  const handleDownload = async (file) => {
    try { await fileService.downloadFile(file.id, file.name); } catch { toast.error("Download failed"); }
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="w-5 h-5 text-primary" />;
    if (type.includes("image")) return <ImageIcon className="w-5 h-5 text-tertiary" />;
    if (type.includes("pdf")) return <FileText className="w-5 h-5 text-error" />;
    return <File className="w-5 h-5 text-primary" />;
  };

  const filtered = files.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.ownerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 font-inter pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            {user?.role === 'manager' ? 'Team Vault' : 'Enterprise Vault'} <Building2 className="w-6 h-6 text-secondary opacity-50" />
          </h1>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">
            {user?.role === 'manager' ? `Files visible to your team (${files.length})` : `All company files (${files.length})`}
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input type="text" placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container/50 border ghost-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 w-64" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30">
          <Building2 className="w-24 h-24 mb-6" />
          <h3 className="text-xl font-black font-manrope uppercase tracking-widest">No Enterprise Files</h3>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b ghost-border text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 bg-surface-container-low/30">
                <th className="py-5 px-6">File</th>
                <th className="py-5 px-6 hidden md:table-cell">Owner</th>
                <th className="py-5 px-6 hidden lg:table-cell">Size</th>
                <th className="py-5 px-6 hidden lg:table-cell">Date</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((file) => (
                <tr key={file.id} className="group border-b ghost-border last:border-0 hover:bg-primary/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.mimeType)}
                      <span className="text-sm font-bold truncate max-w-[250px]">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden md:table-cell">{file.ownerName}</td>
                  <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden lg:table-cell">{formatFileSize(file.fileSize)}</td>
                  <td className="py-4 px-6 text-xs font-bold text-on-surface-variant hidden lg:table-cell">{safeFormat(file.createdAt, 'MMM dd')}</td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => handleDownload(file)}
                      className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                      <Download className="w-4 h-4" />
                    </button>
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
