import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';
import { verifyAdminPassword } from '../lib/storage';

export default function LoginModal({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        if (rememberMe) {
          localStorage.setItem('beliz_auth_token', 'logged_in_' + Date.now());
        } else {
          sessionStorage.setItem('beliz_auth_token', 'logged_in_' + Date.now());
        }
        onLoginSuccess();
      } else {
        setError('Hatalı şifre! Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white text-center relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/20 shadow-inner">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Yönetici Girişi</h1>
          <p className="text-indigo-100 text-sm mt-1">
            Öğrenci, Yoklama ve Ödeme Yönetim Sistemi
          </p>
          <div className="absolute top-4 right-4 bg-white/20 text-xs px-2.5 py-1 rounded-full text-white font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Tek Yönetici
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Yönetici Şifresi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifrenizi girin..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm font-medium"
                autoFocus
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              Beni bu cihazda hatırla
            </label>
            <span className="text-slate-400">Tek Yetkili</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Doğrulanıyor...' : 'Giriş Yap'}
          </button>

          {/* Quick Default Note */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800">
            <span className="font-bold">İlk Giriş İçin Varsayılan Şifre:</span>{' '}
            <code className="bg-amber-100/80 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">admin123</code>
            <p className="mt-1 text-[11px] text-amber-700">
              Giriş yaptıktan sonra sağ üstteki Ayarlar menüsünden şifrenizi dilediğiniz zaman değiştirebilirsiniz.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
