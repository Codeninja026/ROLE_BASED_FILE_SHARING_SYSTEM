import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Search, ChevronLeft, ChevronRight, 
  Eye, CornerDownRight, Clock, ShieldCheck,
  Terminal, Server, Globe, Mail, Code
} from 'lucide-react';
import axios from 'axios';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/ui/Modal';
import { safeFormat } from '../utils/dateUtils';

export const AuditLogsPage = () => {
  const [traces, setTraces] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const fetchTraces = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/admin/traces?page=${page}&size=15`);
      if (response.data.success) {
        setTraces(response.data.data.content);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      }
    } catch (err) {
      toast.error("Failed to load audit traces");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTraces(0);
  }, []);

  const filteredTraces = traces.filter(t => 
    t.url.toLowerCase().includes(search.toLowerCase()) || 
    (t.userEmail && t.userEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8 pb-16">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-manrope tracking-tighter flex items-center gap-3">
            System Audit <Terminal className="w-8 h-8 text-primary opacity-50" />
          </h1>
          <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1">
            Real-time API traffic monitoring & deep session tracing
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Filter by URL or Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container/50 border ghost-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary/50 w-72"
          />
        </div>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b ghost-border text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60 bg-surface-container-low/30">
                <th className="py-5 px-6">Timestamp</th>
                <th className="py-5 px-6">Method / URL</th>
                <th className="py-5 px-6">User</th>
                <th className="py-5 px-6">Status</th>
                <th className="py-5 px-6">Origin</th>
                <th className="py-5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b ghost-border last:border-0">
                    <td colSpan="6" className="py-8 px-6 bg-surface-container-low/20" />
                  </tr>
                ))
              ) : (
                filteredTraces.map((trace) => (
                  <tr key={trace.id} className="group border-b ghost-border last:border-0 hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {safeFormat(trace.timestamp, 'HH:mm:ss')}
                          <span className="ml-2 text-on-surface-variant/50 font-normal">
                            {safeFormat(trace.timestamp, 'MMM dd')}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 max-w-sm">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                          trace.method === 'GET' ? 'bg-primary/10 text-primary' : 
                          trace.method === 'POST' ? 'bg-secondary/10 text-secondary' : 
                          'bg-tertiary/10 text-tertiary'
                        }`}>
                          {trace.method}
                        </span>
                        <span className="text-xs font-mono font-bold truncate text-on-surface/80" title={trace.url}>
                          {trace.url.replace('/api', '')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant truncate max-w-[150px]">
                          {trace.userEmail || <span className="italic opacity-30">Anonymous</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                        trace.status >= 200 && trace.status < 300 ? 'bg-success/10 text-success' :
                        trace.status >= 400 ? 'bg-error/10 text-error' :
                        'bg-surface-container text-on-surface-variant'
                      }`}>
                        {trace.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span className="text-xs font-bold text-on-surface-variant">{trace.remoteAddr}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => setSelectedTrace(trace)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button 
            disabled={currentPage === 0}
            onClick={() => fetchTraces(currentPage - 1)}
            className="p-2 rounded-xl border ghost-border hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-on-surface-variant uppercase tracking-widest">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages - 1}
            onClick={() => fetchTraces(currentPage + 1)}
            className="p-2 rounded-xl border ghost-border hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Trace Details Modal */}
      <Modal 
        isOpen={!!selectedTrace} 
        onClose={() => setSelectedTrace(null)} 
        title="Trace Payload Analysis"
        maxWidth="max-w-4xl"
      >
        {selectedTrace && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <MetadataBox icon={Activity} label="Transaction ID" value={`#TRC-${selectedTrace.id}`} />
              <MetadataBox icon={Clock} label="Precise Time" value={selectedTrace.timestamp} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <CornerDownRight className="w-4 h-4" /> Request Body
              </div>
              <pre className="bg-surface-container-low rounded-2xl p-6 text-xs font-mono text-on-surface border ghost-border overflow-x-auto">
                {selectedTrace.requestBody ? formatJSON(selectedTrace.requestBody) : "// NO PAYLOAD"}
              </pre>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                <CornerDownRight className="w-4 h-4" /> Response Body
              </div>
              <pre className="bg-surface-container-low rounded-2xl p-6 text-xs font-mono text-on-surface border ghost-border overflow-x-auto">
                {selectedTrace.responseBody ? formatJSON(selectedTrace.responseBody) : "// NO RESPONSE STORED"}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const MetadataBox = ({ icon: Icon, label, value }) => (
  <div className="bg-surface-container/50 rounded-2xl p-4 border ghost-border">
    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center gap-2 text-sm font-bold truncate">
      <Icon className="w-3.5 h-3.5 text-primary" />
      {value}
    </div>
  </div>
);

const formatJSON = (jsonString) => {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return jsonString;
  }
};
