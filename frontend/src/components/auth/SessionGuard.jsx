import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/**
 * SessionGuard monitors user activity and automatically logs out 
 * after 30 minutes of inactivity.
 */
export const SessionGuard = ({ children }) => {
  const { logout, user } = useAuth();
  const toast = useToast();
  const timeoutRef = useRef(null);
  
  // 30 minutes in milliseconds
  const INACTIVITY_LIMIT = 30 * 60 * 1000; 

  const handleLogout = useCallback(() => {
    if (user) {
      toast.info("Session expired due to inactivity");
      logout();
    }
  }, [logout, user, toast]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (user) {
      timeoutRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    }
  }, [handleLogout, user, INACTIVITY_LIMIT]);

  useEffect(() => {
    if (!user) return;

    // Initial timer
    resetTimer();

    // Activity listeners
    const activityEvents = [
      'mousedown', 
      'keydown', 
      'scroll', 
      'touchstart', 
      'mousemove'
    ];

    const eventHandler = () => resetTimer();

    activityEvents.forEach(event => {
      window.addEventListener(event, eventHandler);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      activityEvents.forEach(event => {
        window.removeEventListener(event, eventHandler);
      });
    };
  }, [user, resetTimer]);

  return <>{children}</>;
};
