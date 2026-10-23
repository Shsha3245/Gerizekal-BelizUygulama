import React, { useState } from 'react';
import { FolderPlus, Trash2, X, PlusCircle, Layers } from 'lucide-react';

export default function ClassModal({ isOpen, onClose, classes, onAddClass, onDeleteClass }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('normal'); // 'normal' or 'belediye'

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddClass({ name: name.trim(), category });
    setName('');
  };

  const normalList = classes.filter(c => c.category === 'normal');
  const belediyeList = classes.filter(c => c.category === 'belediye');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Sınıf ve Grup Yönetimi</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add New Class Form */}
          <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-indigo-600" /> Yeni Sınıf Ekle
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: 17.30 Sınıfı veya (İl) Sınıf 2"
                className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="normal">Normal Yoklama</option>
                <option value="belediye">Belediye Yoklama</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              + Sınıfı Listeye Ekle
            </button>
          </form>

          {/* Existing Classes List */}
          <div className="space-y-4">
            {/* Normal Classes */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Normal Ders Sınıfları ({normalList.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {normalList.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
                    <span>{c.name}</span>
                    <button
                      onClick={() => {
                        if (confirm(`"${c.name}" sınıfını silmek istediğinize emin misiniz?`)) {
                          onDeleteClass(c.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Belediye Classes */}
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Belediye Sınıfları ({belediyeList.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {belediyeList.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-800">
                    <span>{c.name}</span>
                    <button
                      onClick={() => {
                        if (confirm(`"${c.name}" sınıfını silmek istediğinize emin misiniz?`)) {
                          onDeleteClass(c.id);
                        }
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
