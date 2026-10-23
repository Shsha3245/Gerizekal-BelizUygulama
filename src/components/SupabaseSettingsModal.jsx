import React, { useState, useEffect } from 'react';
import { 
  Database, 
  X, 
  Check, 
  Copy, 
  AlertCircle, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig, 
  testSupabaseConnection 
} from '../lib/supabase';
import { migrateLocalToSupabase } from '../lib/storage';

export default function SupabaseSettingsModal({ isOpen, onClose, onConfigSaved }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getStoredSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setMigrateResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Lütfen URL ve Anon Key alanlarını doldurun.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(url, anonKey);
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    saveSupabaseConfig(url, anonKey);
    onConfigSaved();
    onClose();
  };

  const handleDisconnect = () => {
    saveSupabaseConfig('', '');
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigSaved();
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setMigrateResult(null);
    try {
      await migrateLocalToSupabase();
      setMigrateResult({ success: true, message: 'Tüm öğrenci, sınıf ve ödeme verileri Supabase veritabanına başarıyla yüklendi!' });
    } catch (err) {
      setMigrateResult({ success: false, message: 'Aktarım hatası: ' + err.message });
    } finally {
      setMigrating(false);
    }
  };

  const handleCopySql = async () => {
    const { default: schemaSql } = await import('../../supabase_schema.sql?raw');
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">Supabase Bulut Veritabanı Ayarları</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Quick Guide Card */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Supabase Nasıl Bağlanır?
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li>
                <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium inline-flex items-center gap-0.5">
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>{' '}
                üzerinde ücretsiz projenizi açın.
              </li>
              <li>
                Aşağıdaki butona basarak <strong>SQL Şemasını Kopyalayın</strong> ve Supabase Dashboard &rarr; <strong>SQL Editor</strong> kısmına yapıştırıp "Run" yapın.
              </li>
              <li>Project Settings &rarr; API bölümünden <strong>Project URL</strong> ve <strong>anon public key</strong> bilgilerini buraya yapıştırın.</li>
            </ol>

            <button
              onClick={handleCopySql}
              className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedSql ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Kodu Kopyalandı!' : '1-Tıkla SQL Kodunu Kopyala'}</span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Migrate feedback */}
          {migrateResult && (
            <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              migrateResult.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {migrateResult.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{migrateResult.message}</span>
            </div>
          )}

          {/* Test & Data Migration Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
            </button>

            {url && anonKey && (
              <button
                type="button"
                onClick={handleMigrate}
                disabled={migrating}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Şu anki yerel öğrenci ve ödeme verilerini Supabase'e yükler"
              >
                <UploadCloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>{migrating ? 'Yükleniyor...' : 'Mevcut Verileri Supabase\'e Yükle'}</span>
              </button>
            )}

            {url && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold ml-auto cursor-pointer"
              >
                Bağlantıyı Kaldır (Yerel Mod)
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            Kaydet & Uygula
          </button>
        </div>
      </div>
    </div>
  );
}
