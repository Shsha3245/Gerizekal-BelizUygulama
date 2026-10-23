import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Filter, 
  Search, 
  DollarSign, 
  Calendar, 
  FileSpreadsheet, 
  Info,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MONTHS } from '../lib/defaultData';
import { togglePaymentStatus } from '../lib/storage';

export default function PaymentsView({ 
  classes, 
  students, 
  payments, 
  selectedYear,
  setSelectedYear,
  onRefreshPayments,
  onError,
  paymentsLoading = false,
  selectedClassFilter,
  setSelectedClassFilter 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePaymentModal, setActivePaymentModal] = useState(null); // for editing amount & note

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = Math.min(currentYear - 1, selectedYear); y <= Math.max(currentYear + 1, selectedYear); y++) {
    yearOptions.push(y);
  }

  // Filter students based on class selection and search query
  const filteredStudents = students.filter(student => {
    const matchesClass = selectedClassFilter === 'ALL' || student.class_id === selectedClassFilter;
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const getClassFee = (student) => {
    const cls = classes.find(c => c.id === student.class_id);
    return Number(cls?.monthly_fee) || 0;
  };

  // Helper to check payment status for a student and month
  const getPayment = (studentId, month) => {
    return payments.find(p => p.student_id === studentId && p.month === month && p.year === selectedYear);
  };

  // Toggle payment status (Admin işte artı/tik koyucak!)
  const handleToggle = async (student, month, e) => {
    e.stopPropagation();
    const current = getPayment(student.id, month);
    const nextState = !current?.is_paid;

    if (nextState) {
      // Fire confetti when payment is received!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {
        // ignore
      }
    }

    try {
      await togglePaymentStatus(student.id, month, selectedYear, nextState, {
        amount: Number(current?.amount) || getClassFee(student),
        note: current?.note || '',
        paid_date: nextState ? new Date().toISOString().split('T')[0] : null
      });
    } catch (err) {
      onError?.(err.message);
      return;
    }

    onRefreshPayments();
  };

  // Save payment details from modal
  const handleSavePaymentDetail = async (e) => {
    e.preventDefault();
    if (!activePaymentModal) return;

    try {
      await togglePaymentStatus(
        activePaymentModal.student.id,
        activePaymentModal.month,
        selectedYear,
        activePaymentModal.is_paid,
        {
          amount: Number(activePaymentModal.amount) || 0,
          note: activePaymentModal.note || '',
          paid_date: activePaymentModal.paid_date || new Date().toISOString().split('T')[0]
        }
      );
    } catch (err) {
      onError?.(err.message);
      return;
    }

    setActivePaymentModal(null);
    onRefreshPayments();
  };

  // Statistics calculation
  let totalPaidCount = 0;
  let totalUnpaidCount = 0;
  let totalCollectedAmount = 0;

  filteredStudents.forEach(s => {
    MONTHS.forEach(m => {
      const p = getPayment(s.id, m);
      if (p?.is_paid) {
        totalPaidCount++;
        totalCollectedAmount += Number(p.amount || 0);
      } else {
        totalUnpaidCount++;
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Ödeme Takibi & Çizelgesi</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Defterdeki gibi: Tıklayarak <span className="text-emerald-700 font-bold">yeşil tik/artı (ödendi)</span> veya <span className="text-red-700 font-bold">kırmızı (ödenmedi)</span> yapabilirsiniz.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold text-emerald-600 uppercase">Ödenen Taksit</span>
              <span className="text-base font-extrabold text-emerald-800">
                {totalPaidCount} <span className="text-xs font-normal">Ay</span>
              </span>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold text-red-600 uppercase">Bekleyen Taksit</span>
              <span className="text-base font-extrabold text-red-800">
                {totalUnpaidCount} <span className="text-xs font-normal">Ay</span>
              </span>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold text-indigo-600 uppercase">Toplam Tahsilat</span>
              <span className="text-base font-extrabold text-indigo-800">
                ₺{totalCollectedAmount.toLocaleString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar: Class Selector & Search ("İstediği Sınıfı Seç") */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Class filter dropdown / pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Sınıf Filtresi:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">Tüm Sınıflar ({students.length} Öğrenci)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({students.filter(s => s.class_id === c.id).length} Öğrenci)
                </option>
              ))}
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y} - {y + 1} Dönemi</option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı ile filtrele..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Main Payment Table Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className={`overflow-x-auto transition-opacity ${paymentsLoading ? 'opacity-40 pointer-events-none' : ''}`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 min-w-[180px]">Öğrenci Adı</th>
                <th className="py-3.5 px-3 min-w-[120px]">Sınıf</th>
                {MONTHS.map(month => (
                  <th key={month} className="py-3.5 px-2 text-center min-w-[75px]">
                    {month}
                  </th>
                ))}
                <th className="py-3.5 px-3 text-center min-w-[90px]">Toplam Ödenen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={MONTHS.length + 3} className="py-12 text-center text-slate-400">
                    Seçilen sınıfta öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  let studentPaidMonthsCount = 0;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Student Name */}
                      <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/50 z-10 border-r border-slate-100 shadow-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <span>{student.name}</span>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                          {student.class_name}
                        </span>
                      </td>

                      {/* Month Columns (Defter Çiziminiz: Yeşil ve Kırmızı Kutular) */}
                      {MONTHS.map((month) => {
                        const payment = getPayment(student.id, month);
                        const isPaid = payment?.is_paid || false;
                        if (isPaid) studentPaidMonthsCount++;

                        return (
                          <td key={month} className="py-2.5 px-1.5 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={(e) => handleToggle(student, month, e)}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  // Right click to edit details (amount, note)
                                  setActivePaymentModal({
                                    student,
                                    month,
                                    is_paid: isPaid,
                                    amount: Number(payment?.amount) || getClassFee(student),
                                    note: payment?.note ?? '',
                                    paid_date: payment?.paid_date ?? new Date().toISOString().split('T')[0]
                                  });
                                }}
                                title={`${month}: ${isPaid ? 'Ödendi (Yeşil) - Detay için sağ tıkla' : 'Ödenmedi (Kırmızı) - Tıkla ve öde'}`}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer select-none group relative ${
                                  isPaid
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 scale-100 hover:scale-105 ring-2 ring-emerald-500/20'
                                    : 'bg-red-50 text-red-500 border border-red-300 hover:bg-red-100 hover:border-red-400 scale-95 hover:scale-100'
                                }`}
                              >
                                {isPaid ? (
                                  <Check className="w-5 h-5 stroke-[2.5]" />
                                ) : (
                                  <X className="w-4 h-4 text-red-400 group-hover:text-red-600 stroke-[2]" />
                                )}
                              </button>
                            </div>
                          </td>
                        );
                      })}

                      {/* Total Paid Months for Student */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          studentPaidMonthsCount > 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {studentPaidMonthsCount} / {MONTHS.length}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend / Info Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 bg-emerald-600 rounded-md inline-block shadow-xs"></span>
              <span className="text-emerald-800 font-bold">Yeşil Tik:</span> Ödendi
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3.5 h-3.5 bg-red-50 border border-red-300 rounded-md inline-block"></span>
              <span className="text-red-800 font-bold">Kırmızı:</span> Ödenmedi
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Kutuya tek tık: Durumu değiştirir. Sağ tık: Tutar ve açıklama notu ekler.</span>
          </div>
        </div>
      </div>

      {/* Payment Edit Detail Modal (Sağ Tık / Detay Düzenleme) */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">
                Ödeme Detayı: {activePaymentModal.month} {selectedYear}
              </h3>
              <button
                onClick={() => setActivePaymentModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Kapat
              </button>
            </div>

            <div className="text-xs text-slate-600 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              Öğrenci: <strong className="text-slate-900">{activePaymentModal.student.name}</strong>
              <div className="text-[11px] text-slate-500 mt-0.5">{activePaymentModal.student.class_name}</div>
            </div>

            <form onSubmit={handleSavePaymentDetail} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ödeme Durumu</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal(prev => ({ ...prev, is_paid: true }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      activePaymentModal.is_paid 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ✓ Ödendi
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaymentModal(prev => ({ ...prev, is_paid: false }))}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      !activePaymentModal.is_paid 
                        ? 'bg-red-600 text-white border-red-600 shadow-xs' 
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    ✗ Ödenmedi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tutar (TL)</label>
                <input
                  type="number"
                  value={activePaymentModal.amount}
                  onChange={(e) => setActivePaymentModal(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder={String(getClassFee(activePaymentModal.student))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ödeme Tarihi</label>
                <input
                  type="date"
                  value={activePaymentModal.paid_date}
                  onChange={(e) => setActivePaymentModal(prev => ({ ...prev, paid_date: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Açıklama / Makbuz Notu</label>
                <input
                  type="text"
                  value={activePaymentModal.note}
                  onChange={(e) => setActivePaymentModal(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Örn: Havale yapıldı, Nakit alındı vb."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActivePaymentModal(null)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
