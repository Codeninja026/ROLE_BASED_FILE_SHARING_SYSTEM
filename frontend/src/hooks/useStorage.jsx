import { useState, useEffect, useCallback } from 'react';
import { fileService } from '../services/fileService';
import { useAuth } from '../context/AuthContext';

export const useStorage = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    usedBytes: 0,
    usedGB: 0,
    percentage: 0,
    remainingGB: 100,
    totalBytes: 100 * 1024 * 1024 * 1024,
    fileCount: 0,
    typeDistribution: {}
  });

  const refreshFiles = useCallback(async () => {
    if (!user) return;
    try {
      const [filesData, metricsData] = await Promise.all([
        fileService.getFiles(),
        fileService.getMetrics()
      ]);
      setFiles(filesData);
      setMetrics({
        ...metricsData,
        usedGB: (metricsData.usedBytes || 0) / (1024 * 1024 * 1024),
        remainingGB: ((metricsData.totalBytes || 0) - (metricsData.usedBytes || 0)) / (1024 * 1024 * 1024)
      });
    } catch (e) {
      console.error('Failed to refresh data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshFiles();
    }
  }, [user, refreshFiles]);

  return {
    files,
    isLoading,
    refreshFiles,
    metrics
  };
};
