import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Check, 
  X, 
  Clock, 
  Users, 
  ChevronRight, 
  ChevronDown, 
  Save, 
  CheckCheck,
  History,
  AlertCircle
} from 'lucide-react';
import { getAttendance, saveAttendanceBatch } from '../lib/storage';

export default function AttendanceView({ 
  classes, 
  students, 
  categoryFilter = 'normal', // 'normal' or 'belediye'
  title = 'Yoklama' 
}) {
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: { status: 'geldi'|'gelmedi'|'izinli', notes: '' } }
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  // Filter classes by category
  const filteredClasses = classes.filter(c => c.category === categoryFilter);

  // Auto-select first class if none selected
  useEffect(() => {
    if (filteredClasses.length > 0 && (!selectedClassId || !filteredClasses.some(c => c.id === selectedClassId))) {
      setSelectedClassId(filteredClasses[0].id);
    }
  }, [categoryFilter, classes]);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = students.filter(s => s.class_id === selectedClassId);

  // Load attendance when class or date changes
  useEffect(() => {
    if (!selectedClassId) return;

    let isMounted = true;
    async function load() {
      setLoading(true);
      try {
        const records = await getAttendance(selectedClassId, selectedDate);
        if (!isMounted) return;

        const map = {};
        // Default all students to 'geldi' or whatever was previously recorded
        classStudents.forEach(s => {
          const rec = records.find(r => r.student_id === s.id);
          map[s.id] = {
            status: rec ? rec.status : 'geldi',
            notes: rec?.notes || ''
          };
        });
        setAttendanceMap(map);
      } catch (err) {
        console.error('Error loading attendance:', err);
        if (isMounted) alert(err.message || 'Yoklama yüklenemedi.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [selectedClassId, selectedDate, classStudents.length]);

  // Load history
  const loadHistory = async () => {
    if (!selectedClassId) return;
    let records;
    try {
      records = await getAttendance(selectedClassId);
    } catch (err) {
      alert(err.message || 'Geçmiş yoklamalar yüklenemedi.');
      return;
    }
    // group by date
    const byDate = {};
    records.forEach(r => {
      if (!byDate[r.date]) {
        byDate[r.date] = { date: r.date, total: 0, geldi: 0, gelmedi: 0, izinli: 0 };
      }
      byDate[r.date].total += 1;
      if (r.status === 'geldi') byDate[r.date].geldi += 1;
      else if (r.status === 'gelmedi') byDate[r.date].gelmedi += 1;
      else if (r.status === 'izinli') byDate[r.date].izinli += 1;
    });
    setHistoryList(Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date)));
    setShowHistory(true);
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status
      }
    }));
  };

  const handleNoteChange = (studentId, notes) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        notes
      }
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    classStudents.forEach(s => {
      updated[s.id] = {
        ...(attendanceMap[s.id] || {}),
        status
      };
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const records = classStudents.map(s => ({
        class_id: selectedClassId,
        student_id: s.id,
        date: selectedDate,
        status: attendanceMap[s.id]?.status || 'geldi',
        notes: attendanceMap[s.id]?.notes || ''
      }));

      await saveAttendanceBatch(records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert(err.message || 'Yoklama kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: classStudents.length,
    geldi: Object.values(attendanceMap).filter(v => v.status === 'geldi').length,
    gelmedi: Object.values(attendanceMap).filter(v => v.status === 'gelmedi').length,
    izinli: Object.values(attendanceMap).filter(v => v.status === 'izinli').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>{title}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {categoryFilter === 'belediye' ? 'Belediye Kursları' : 'Normal Dersler'}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Defterdeki gibi sınıfı seçin, yoklama listesi otomatik açılsın.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-medium text-xs sm:text-sm focus:outline-none cursor-pointer"
              />
            </div>
            <button
              onClick={() => {
                if (showHistory) setShowHistory(false);
                else loadHistory();
              }}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                showHistory 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Geçmiş Yoklamaları Gör"
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">Geçmiş</span>
            </button>
          </div>
        </div>

        {/* Classes Horizontal Selector (Defterdeki: 13.00 Sınıfı, 14.30 Sınıfı, 16.00 Sınıfı veya (G) Sınıf 1...) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
            Sınıf Seçin (Bastın Açıldı Yoklama):
          </label>
          <div className="flex flex-wrap gap-2.5">
            {filteredClasses.length === 0 ? (
              <div className="text-sm text-slate-400 italic py-2">
                Bu kategoride henüz sınıf bulunmuyor. Sağ üstteki + butonundan sınıf ekleyebilirsiniz.
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                const count = students.filter(s => s.class_id === cls.id).length;
                return (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClassId(cls.id);
                      setShowHistory(false);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <span>{cls.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {count} Öğr.
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* History Modal / Drawer if opened */}
      {showHistory && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>{selectedClass?.name} - Geçmiş Yoklama Kayıtları</span>
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Kapat
            </button>
          </div>
          {historyList.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Bu sınıfa ait geçmiş yoklama kaydı bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {historyList.map(h => (
                <div
                  key={h.date}
                  onClick={() => {
                    setSelectedDate(h.date);
                    setShowHistory(false);
                  }}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-800 mb-2">
                    <span>{h.date}</span>
                    <span className="text-slate-400 text-[11px]">{h.total} Öğrenci</span>
                  </div>
                  <div className="flex gap-2 text-[11px]">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">✓ {h.geldi} Geldi</span>
                    <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">✗ {h.gelmedi}</span>
                    {h.izinli > 0 && <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">⏳ {h.izinli}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Attendance List: "Bastın Açıldı Yoklama" */}
      {selectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Header toolbar */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{selectedClass.name}</span>
                <span className="text-xs text-slate-500 font-medium">({selectedDate} Tarihli Yoklama)</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  {stats.geldi} Geldi
                </span>
                <span className="text-red-700 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                  {stats.gelmedi} Gelmedi
                </span>
                {stats.izinli > 0 && (
                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                    {stats.izinli} İzinli
                  </span>
                )}
                <span className="text-slate-400 font-medium">Toplam: {stats.total} Öğrenci</span>
              </div>
            </div>

            {/* Quick Bulk Actions & Save */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => handleMarkAll('geldi')}
                className="text-xs px-3 py-2 bg-white hover:bg-slate-100 text-emerald-700 font-semibold rounded-xl border border-emerald-200 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Tüm öğrencileri geldi olarak işaretle"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tümünü Geldi Yap</span>
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="text-xs px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}</span>
              </button>
            </div>
          </div>

          {/* Success banner */}
          {saveSuccess && (
            <div className="bg-emerald-500 text-white text-xs font-semibold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Yoklama başarıyla kaydedildi!
            </div>
          )}

          {/* Student Rows */}
          {classStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">Bu sınıfta henüz öğrenci yok</p>
              <p className="text-xs mt-1">"Kayıtlı Öğrenci" sekmesinden bu sınıfa yeni öğrenci kaydedebilirsiniz.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {classStudents.map((student, index) => {
                const currentStatus = attendanceMap[student.id]?.status || 'geldi';
                const currentNote = attendanceMap[student.id]?.notes || '';

                return (
                  <div
                    key={student.id}
                    className={`p-4 sm:px-6 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      currentStatus === 'geldi'
                        ? 'hover:bg-emerald-50/20'
                        : currentStatus === 'gelmedi'
                        ? 'bg-red-50/30 hover:bg-red-50/50'
                        : 'bg-amber-50/30 hover:bg-amber-50/50'
                    }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                          {student.phone && <span>Tel: {student.phone}</span>}
                          {student.parent_phone && <span>• Veli: {student.parent_phone}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Geldi Button */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'geldi')}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentStatus === 'geldi'
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Geldi</span>
                      </button>

                      {/* Gelmedi Button */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'gelmedi')}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentStatus === 'gelmedi'
                            ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                            : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Gelmedi</span>
                      </button>

                      {/* İzinli Button */}
                      <button
                        onClick={() => handleStatusChange(student.id, 'izinli')}
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentStatus === 'izinli'
                            ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                            : 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>İzinli</span>
                      </button>

                      {/* Quick Note Input */}
                      <input
                        type="text"
                        value={currentNote}
                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                        placeholder="Not (opsiyonel)..."
                        className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 w-32 md:w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
