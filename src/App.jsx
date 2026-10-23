import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import AttendanceView from './components/AttendanceView';
import StudentsView from './components/StudentsView';
import PaymentsView from './components/PaymentsView';
import StudentModal from './components/StudentModal';
import ClassModal from './components/ClassModal';
import PasswordModal from './components/PasswordModal';
import SupabaseSettingsModal from './components/SupabaseSettingsModal';

import { 
  getClasses, 
  addClass, 
  deleteClass, 
  getStudents, 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  getPayments 
} from './lib/storage';

import { 
  ClipboardCheck, 
  Building2, 
  Users, 
  CreditCard, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';

export default function App() {
  // Authentication state (Single admin)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!(localStorage.getItem('beliz_auth_token') || sessionStorage.getItem('beliz_auth_token'));
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState('yoklama'); // 'yoklama' | 'belediye' | 'ogrenciler' | 'odeme'
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  // Data states
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Bottom Ödeme quick panel toggle (from notebook sketch: "Ödeme -> Bastın Açıldı")
  const [isPaymentPanelExpanded, setIsPaymentPanelExpanded] = useState(true);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [cls, std, pay] = await Promise.all([
        getClasses(),
        getStudents(),
        getPayments()
      ]);
      setClasses(cls);
      setStudents(std);
      setPayments(pay);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('beliz_auth_token');
    sessionStorage.removeItem('beliz_auth_token');
    setIsAuthenticated(false);
  };

  // Student actions
  const handleSaveStudent = async (studentData) => {
    if (studentToEdit) {
      await updateStudent(studentToEdit.id, studentData);
    } else {
      await addStudent(studentData);
    }
    setIsStudentModalOpen(false);
    setStudentToEdit(null);
    loadData();
  };

  const handleDeleteStudent = async (studentId) => {
    await deleteStudent(studentId);
    loadData();
  };

  // Class actions
  const handleAddClass = async (classData) => {
    await addClass(classData);
    loadData();
  };

  const handleDeleteClass = async (classId) => {
    await deleteClass(classId);
    loadData();
  };

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        onLogout={handleLogout}
        onOpenSettings={() => setIsSupabaseModalOpen(true)}
        onOpenClassModal={() => setIsClassModalOpen(true)}
        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
        studentCount={students.length}
        classCount={classes.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Navigation Tabs (Defter Çiziminiz: Yoklama, Belediye Yoklama, Kayıtlı Öğrenci, Ödeme) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-2">
          {/* Tab 1: Yoklama */}
          <button
            onClick={() => setActiveTab('yoklama')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'yoklama'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Yoklama (Normal)</span>
          </button>

          {/* Tab 2: Belediye Yoklama */}
          <button
            onClick={() => setActiveTab('belediye')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'belediye'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Belediye Yoklama</span>
          </button>

          {/* Tab 3: Kayıtlı Öğrenci */}
          <button
            onClick={() => setActiveTab('ogrenciler')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'ogrenciler'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kayıtlı Öğrenci</span>
          </button>

          {/* Tab 4: Ödeme Takibi */}
          <button
            onClick={() => setActiveTab('odeme')}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'odeme'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Ödeme Çizelgesi</span>
          </button>
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center text-slate-400 border border-slate-200">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold text-slate-600">Veriler yükleniyor...</p>
          </div>
        ) : (
          <>
            {/* 1. Normal Yoklama */}
            {activeTab === 'yoklama' && (
              <AttendanceView
                classes={classes}
                students={students}
                categoryFilter="normal"
                title="Normal Ders Yoklaması"
              />
            )}

            {/* 2. Belediye Yoklama */}
            {activeTab === 'belediye' && (
              <AttendanceView
                classes={classes}
                students={students}
                categoryFilter="belediye"
                title="Belediye Kurs Yoklaması"
              />
            )}

            {/* 3. Kayıtlı Öğrenciler */}
            {activeTab === 'ogrenciler' && (
              <StudentsView
                classes={classes}
                students={students}
                payments={payments}
                onAddStudent={() => {
                  setStudentToEdit(null);
                  setIsStudentModalOpen(true);
                }}
                onEditStudent={(std) => {
                  setStudentToEdit(std);
                  setIsStudentModalOpen(true);
                }}
                onDeleteStudent={handleDeleteStudent}
              />
            )}

            {/* 4. Ödeme Çizelgesi (Dedicated Tab) */}
            {activeTab === 'odeme' && (
              <PaymentsView
                classes={classes}
                students={students}
                payments={payments}
                onRefreshPayments={loadData}
                selectedClassFilter={selectedClassFilter}
                setSelectedClassFilter={setSelectedClassFilter}
              />
            )}

            {/* Notebook Sketch Layout Bonus: When viewing Yoklama or Belediye, show the collapsible Ödeme section at bottom */}
            {(activeTab === 'yoklama' || activeTab === 'belediye') && (
              <div className="mt-8 border-t-2 border-dashed border-slate-300 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Hızlı Ödeme Çizelgesi (Defter Düzeni)
                    </span>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                      Bastın Açıldı
                    </span>
                  </div>
                  <button
                    onClick={() => setIsPaymentPanelExpanded(!isPaymentPanelExpanded)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                  >
                    {isPaymentPanelExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Gizle
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Aç / Göster
                      </>
                    )}
                  </button>
                </div>

                {isPaymentPanelExpanded && (
                  <PaymentsView
                    classes={classes}
                    students={students}
                    payments={payments}
                    onRefreshPayments={loadData}
                    selectedClassFilter={selectedClassFilter}
                    setSelectedClassFilter={setSelectedClassFilter}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setStudentToEdit(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
        classes={classes}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        onAddClass={handleAddClass}
        onDeleteClass={handleDeleteClass}
      />

      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <SupabaseSettingsModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
}
