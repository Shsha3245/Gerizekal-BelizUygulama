import { createClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'beliz_supabase_url';
const STORAGE_KEY_KEY = 'beliz_supabase_anon_key';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveSupabaseConfig(url, anonKey) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  else localStorage.removeItem(STORAGE_KEY_KEY);
  
  _client = null; // Reset cached client
}

let _client = null;

export function getSupabase() {
  if (_client) return _client;
  const { url, anonKey } = getStoredSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    _client = createClient(url, anonKey);
    return _client;
  } catch (err) {
    console.error('Supabase init error:', err);
    return null;
  }
}

export async function testSupabaseConnection(url, anonKey) {
  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('classes').select('count', { count: 'exact', head: true });
    if (error) {
      // If table doesn't exist yet, but connection worked:
      if (error.code === '42P01') {
        return { success: true, message: 'Bağlantı başarılı! Ancak tablolar henüz oluşturulmamış (SQL şemasını çalıştırın).' };
      }
      return { success: false, message: error.message || 'Veritabanına bağlanılamadı.' };
    }
    return { success: true, message: 'Supabase bağlantısı başarılı ve tablolar hazır!' };
  } catch (err) {
    return { success: false, message: err.message || 'Bağlantı hatası oluştu.' };
  }
}
