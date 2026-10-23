import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  UserCheck, 
  Calendar, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Layers,
  FileText
} from 'lucide-react';

export default function StudentsView({ 
  classes, 
  students, 
  onAddStudent, 
  onEditStudent, 
  onDeleteStudent,
  payments = []
}) {
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Filter students based on class selection and search query
  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClassFilter === 'ALL' || student.class_id === selectedClassFilter;
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.phone && student.phone.includes(searchQuery)) ||
      (student.parent_name && student.parent_name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesClass && matchesSearch;
  });

  // Calculate quick stats
  const normalClasses = classes.filter(c => c.category === 'normal');
  const belediyeClasses = classes.filter(c => c.category === 'belediye');

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Kayıtlı Öğrenciler</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                {students.length} Kayıt
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              "Bastın Sınıf Çıktı &rarr; Bastın Öğrenci Detayı" - Öğrenci ekleme, düzenleme ve sınıf listeleri.
            </p>
          </div>

          <button
            onClick={onAddStudent}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Yeni Öğrenci Kaydı</span>
          </button>
        </div>

        {/* Search bar & Class filter chips ("Bastın Sınıf Çıktı") */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim veya telefonla ara..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Quick Class Selector Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedClassFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedClassFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tüm Sınıflar ({students.length})
            </button>
            {classes.map(cls => {
              const count = students.filter(s => s.class_id === cls.id).length;
              const isSelected = selectedClassFilter === cls.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cls.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Student List & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Students Table / Cards ("Bastın Öğrenci") */}
        <div className="lg:col-span-2 space-y-3">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200/80">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-700 text-sm">Öğrenci bulunamadı</p>
              <p className="text-xs mt-1">Arama kriterlerinizi değiştirebilir veya yeni öğrenci ekleyebilirsiniz.</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedStudentDetail?.id === student.id;
              // Check student's paid months
              const studentPayments = payments.filter(p => p.student_id === student.id && p.is_paid);

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudentDetail(student)}
                  className={`bg-white rounded-xl p-4 border transition-all cursor-pointer hover:shadow-md flex items-center justify-between gap-4 ${
                    isSelected 
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Left: Avatar & Name */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{student.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {student.class_name}
                        </span>
                        {student.phone && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-3 h-3" /> {student.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Payment badge & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col items-end text-xs">
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        ✓ {studentPayments.length} Ay Ödendi
                      </span>
                      {student.registered_at && (
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Kayıt: {student.registered_at}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(student);
                        }}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`${student.name} isimli öğrenciyi ve tüm kayıtlarını silmek istediğinize emin misiniz?`)) {
                            onDeleteStudent(student.id);
                            if (selectedStudentDetail?.id === student.id) {
                              setSelectedStudentDetail(null);
                            }
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <ChevronRight className="w-4 h-4 text-slate-400 ml-1" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 1 Col: Student Quick Details Panel ("Bastın Öğrenci Çıktı") */}
        <div className="lg:col-span-1">
          {selectedStudentDetail ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-24 space-y-5">
              {/* Header */}
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-3">
                  {selectedStudentDetail.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="font-bold text-slate-900 text-base">{selectedStudentDetail.name}</h3>
                <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedStudentDetail.class_name}
                </span>
              </div>

              {/* Info Items */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Öğrenci Telefonu:</span>
                  <span className="font-medium text-slate-800">{selectedStudentDetail.phone || 'Belirtilmedi'}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Veli Adı & İletişim:</span>
                  <span className="font-medium text-slate-800">
                    {selectedStudentDetail.parent_name || 'Veli adı yok'}{' '}
                    {selectedStudentDetail.parent_phone && `(${selectedStudentDetail.parent_phone})`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block mb-0.5">Kayıt Tarihi:</span>
                  <span className="font-medium text-slate-800">{selectedStudentDetail.registered_at || '-'}</span>
                </div>

                {selectedStudentDetail.notes && (
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">Özel Notlar:</span>
                    <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 italic border border-slate-100">
                      {selectedStudentDetail.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onEditStudent(selectedStudentDetail)}
                  className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Bilgileri Düzenle
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600 text-xs">Detay Görüntüleme</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Soldaki listeden bir öğrenciye tıklayarak detaylı kartını ve bilgilerini burada görebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
