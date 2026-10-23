import React from 'react';
import { 
  GraduationCap, 
  Database, 
  Settings, 
  LogOut, 
  Key, 
  FolderPlus,
  Users,
  CheckCircle2,
  CloudOff
} from 'lucide-react';
import { getSupabase } from '../lib/supabase';

export default function Navbar({ 
  onLogout, 
  onOpenSettings, 
  onOpenClassModal, 
  onOpenPasswordModal,
  studentCount = 0,
  classCount = 0
}) {
  const isSupabaseActive = !!getSupabase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">BELİZ</span>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                  Yönetici Paneli
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Yoklama, Öğrenci & Ödeme Takip Sistemi</p>
            </div>
          </div>

          {/* Quick Stats & Cloud Status */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Supabase Status Pill */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isSupabaseActive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Supabase Veritabanı Ayarlarını Aç"
            >
              {isSupabaseActive ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Supabase Bulut Aktif</span>
                  <span className="md:hidden">Supabase</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Yerel Mod (Supabase Bağla)</span>
                  <span className="md:hidden">Yerel</span>
                </>
              )}
            </button>

            {/* Quick Metrics */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-900 font-bold">{studentCount}</span> Öğrenci
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 font-medium">
                <span className="text-slate-900 font-bold">{classCount}</span> Sınıf
              </span>
            </div>

            {/* Actions Menu */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenClassModal}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Sınıfları Yönet"
              >
                <FolderPlus className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenPasswordModal}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Şifre Değiştir"
              >
                <Key className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Supabase Ayarları"
              >
                <Database className="w-4 h-4" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1 cursor-pointer"
                title="Güvenli Çıkış"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
