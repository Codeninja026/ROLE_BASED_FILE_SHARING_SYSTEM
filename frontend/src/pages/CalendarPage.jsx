import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, subMonths, addMonths, isSaturday, isSunday } from "date-fns";
import { ChevronLeft, ChevronRight, File, Calendar as CalendarIcon, Clock } from "lucide-react";
import { fileService } from "../services/fileService";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [files, setFiles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const fetchFiles = async () => {
      const data = await fileService.getFiles(user.role, user.id);
      setFiles(data);
    };
    fetchFiles();
  }, [user]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const filesOnDate = (date) => files.filter(f => isSameDay(new Date(f.uploadDate), date));
  const selectedFiles = selectedDate ? filesOnDate(selectedDate) : [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-secondary/10 rounded-2xl text-secondary shadow-glow-secondary border ghost-border">
            <CalendarIcon className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-manrope font-bold text-on-surface tracking-tight">Temporal Grid</h1>
            <p className="text-on-surface-variant font-medium mt-1">Chronological mapping of vault asset history.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-0 bg-surface-container/30 backdrop-blur-md overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <CardHeader className="flex flex-row items-center justify-between px-8 py-8 border-b ghost-border relative z-10">
            <CardTitle className="text-2xl font-manrope">{format(currentDate, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-4 p-1 bg-surface-container rounded-xl border ghost-border">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="hover:bg-surface-variant rounded-lg"><ChevronLeft className="w-5 h-5"/></Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="hover:bg-surface-variant rounded-lg"><ChevronRight className="w-5 h-5"/></Button>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8 pt-6 relative z-10">
            <div className="grid grid-cols-7 gap-4 mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-surface-container-lowest/20 border border-white/5 opacity-40 shadow-inner" />
              ))}
              
              {days.map((day) => {
                const dayFiles = filesOnDate(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isWeekend = isSaturday(day) || isSunday(day);
                
                return (
                  <motion.div 
                    key={day.toString()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square p-3 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                      isSelected 
                        ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(163,166,255,0.15)] ring-1 ring-primary/50" 
                        : isToday 
                          ? "bg-surface-container-highest/50 border-secondary shadow-lg ring-1 ring-secondary/30" 
                          : isWeekend 
                            ? "bg-surface-container-low/40 border-white/5 hover:bg-surface-container transition-colors"
                            : "bg-surface-container border-white/5 hover:border-primary/30 transition-all hover:shadow-xl"
                    }`}
                  >
                    <div className={`text-right text-xs font-bold ${
                      isSelected ? "text-primary" : isToday ? "text-secondary" : "text-on-surface-variant"
                    }`}>
                      {format(day, "d")}
                    </div>
                    
                    <div className="mt-auto flex flex-col items-center">
                      {dayFiles.length > 0 && (
                        <div className="flex flex-col items-center">
                           <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-secondary'} mb-1.5 shadow-[0_0_8px_rgba(163,166,255,0.5)]`} />
                           <div className="text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant group-hover:text-on-surface transition-colors">
                            {dayFiles.length} file{dayFiles.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>

                    {isToday && !isSelected && (
                      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-secondary" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card border-0 bg-secondary/5 h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 text-secondary">
                <Clock className="w-5 h-5" />
                <CardTitle className="text-lg font-manrope">Daily Assets</CardTitle>
              </div>
              <p className="text-xs text-on-surface-variant/80 font-medium mt-1">
                {selectedDate ? format(selectedDate, "EEEE, MMMM do") : "Select a time code"}
              </p>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDate?.toString()}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-3"
                >
                  {selectedFiles.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl bg-surface-container-lowest/30 border border-dashed ghost-border">
                      <CalendarIcon className="w-8 h-8 text-on-surface-variant/20 mx-auto mb-3" />
                      <p className="text-xs text-on-surface-variant font-medium">No assets localized on this temporal sector.</p>
                    </div>
                  ) : (
                    selectedFiles.map(f => (
                      <div key={f.id} className="p-4 bg-surface-container/60 backdrop-blur-md rounded-xl border ghost-border flex items-center gap-4 group hover:bg-surface-variant/50 transition-all">
                        <div className="p-2.5 rounded-lg bg-surface-container-highest text-secondary group-hover:scale-110 transition-transform">
                          <File className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-on-surface truncate pr-2">{f.name}</p>
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
                            {(f.size / (1024 * 1024)).toFixed(2)} MB • {f.permissions?.split('-')[0]} Level
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
