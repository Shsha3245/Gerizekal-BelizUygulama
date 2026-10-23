import { getSupabase } from './supabase';

function requireClient() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase bağlantısı yapılandırılmamış.');
  return supabase;
}

export async function getCurrentSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export function onAuthChange(callback) {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  const supabase = requireClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function changePassword(currentPassword, newPassword) {
  const supabase = requireClient();
  const { data: userData } = await supabase.auth.getUser();
  const email = userData?.user?.email;
  if (!email) throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');

  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
  if (verifyError) throw new Error('Mevcut şifreniz yanlış.');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return true;
}
