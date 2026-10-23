import React, { useState, useEffect } from 'react';
import { User, Phone, BookOpen, Calendar, FileText, X } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSave, studentToEdit, classes }) {
  const [formData, setFormData] = useState({
    name: '',
    class_id: '',
    class_name: '',
    phone: '',
    parent_name: '',
    parent_phone: '',
    registered_at: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name || '',
        class_id: studentToEdit.class_id || (classes[0]?.id || ''),
        class_name: studentToEdit.class_name || (classes[0]?.name || ''),
        phone: studentToEdit.phone || '',
        parent_name: studentToEdit.parent_name || '',
        parent_phone: studentToEdit.parent_phone || '',
        registered_at: studentToEdit.registered_at || new Date().toISOString().split('T')[0],
        notes: studentToEdit.notes || ''
      });
    } else {
      setFormData({
        name: '',
        class_id: classes[0]?.id || '',
        class_name: classes[0]?.name || '',
        phone: '',
        parent_name: '',
        parent_phone: '',
        registered_at: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [studentToEdit, classes, isOpen]);

  if (!isOpen) return null;

  const handleClassChange = (e) => {
    const classId = e.target.value;
    const found = classes.find(c => c.id === classId);
    setFormData(prev => ({
      ...prev,
      class_id: classId,
      class_name: found ? found.name : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">
              {studentToEdit ? 'Öğrenci Kaydını Düzenle' : 'Yeni Öğrenci Kaydı'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ad Soyad */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Öğrenci Adı Soyadı *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Ayşe Yılmaz"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sınıf Seçimi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Kayıt Edilecek Sınıf *
              </label>
              <select
                value={formData.class_id}
                onChange={handleClassChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category === 'belediye' ? 'Belediye' : 'Normal'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Kayıt Tarihi
              </label>
              <input
                type="date"
                value={formData.registered_at}
                onChange={(e) => setFormData({ ...formData, registered_at: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Telefonlar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Öğrenci Telefonu
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Veli Adı Soyadı
              </label>
              <input
                type="text"
                value={formData.parent_name}
                onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                placeholder="Örn: Fatma Yılmaz (Anne)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Veli Telefon Numarası
            </label>
            <input
              type="tel"
              value={formData.parent_phone}
              onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
              placeholder="05XX XXX XX XX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notlar */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
              Özel Notlar & Açıklamalar
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Öğrenci ile ilgili özel ders notları, sağlık durumları vb."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {studentToEdit ? 'Değişiklikleri Kaydet' : 'Öğrenciyi Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
