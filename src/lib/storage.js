import { getSupabase } from './supabase';
import { DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_PAYMENTS } from './defaultData';

const LOCAL_CLASSES_KEY = 'beliz_classes_v1';
const LOCAL_STUDENTS_KEY = 'beliz_students_v1';
const LOCAL_ATTENDANCE_KEY = 'beliz_attendance_v1';
const LOCAL_PAYMENTS_KEY = 'beliz_payments_v1';

// Initialize local storage if not exists
function initLocalStorage() {
  if (!localStorage.getItem(LOCAL_CLASSES_KEY)) {
    localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(DEFAULT_CLASSES));
  }
  if (!localStorage.getItem(LOCAL_STUDENTS_KEY)) {
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem(LOCAL_PAYMENTS_KEY)) {
    localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
  }
  if (!localStorage.getItem(LOCAL_ATTENDANCE_KEY)) {
    // Add sample attendance for today for 13.00 Sınıfı
    const today = new Date().toISOString().split('T')[0];
    const initialAttendance = [
      { id: 'att1', class_id: 'c1', student_id: 's1', date: today, status: 'geldi', notes: '' },
      { id: 'att2', class_id: 'c1', student_id: 's2', date: today, status: 'geldi', notes: '' },
      { id: 'att3', class_id: 'c1', student_id: 's3', date: today, status: 'gelmedi', notes: 'Haber verdi' },
    ];
    localStorage.setItem(LOCAL_ATTENDANCE_KEY, JSON.stringify(initialAttendance));
  }
}

initLocalStorage();

// Supabase yapılandırılmışsa tüm işlemler Supabase üzerinden yapılır ve hatalar
// kullanıcıya iletilir (sessizce yerel kayda düşülmez). Yerel mod sadece
// Supabase hiç yapılandırılmamışsa çalışır.
function fail(action, error) {
  console.error(`Supabase ${action} error:`, error);
  const detail = error?.message ? ` (${error.message})` : '';
  throw new Error(`${action} sırasında veritabanı hatası oluştu${detail}. Verileriniz kaydedilmedi, lütfen tekrar deneyin.`);
}

function readLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function writeLocal(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

// ==========================================
// CLASSES (SINIFLAR)
// ==========================================
export async function getClasses() {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: true });
    if (error) fail('Sınıfları yükleme', error);
    return data || [];
  }
  return readLocal(LOCAL_CLASSES_KEY);
}

export async function addClass({ name, category, monthly_fee = 0 }) {
  const fee = Number(monthly_fee) || 0;
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('classes').insert({
      name,
      category,
      monthly_fee: fee
    }).select().single();
    if (error) fail('Sınıf ekleme', error);
    return data;
  }

  const newClass = {
    id: 'c_' + Date.now(),
    name,
    category, // 'normal' or 'belediye'
    monthly_fee: fee,
    created_at: new Date().toISOString()
  };
  const list = readLocal(LOCAL_CLASSES_KEY);
  list.push(newClass);
  writeLocal(LOCAL_CLASSES_KEY, list);
  return newClass;
}

export async function updateClassFee(classId, monthlyFee) {
  const fee = Number(monthlyFee) || 0;
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('classes').update({ monthly_fee: fee }).eq('id', classId);
    if (error) fail('Sınıf ücretini güncelleme', error);
    return true;
  }
  const list = readLocal(LOCAL_CLASSES_KEY).map(c => (c.id === classId ? { ...c, monthly_fee: fee } : c));
  writeLocal(LOCAL_CLASSES_KEY, list);
  return true;
}

export async function deleteClass(classId) {
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('classes').delete().eq('id', classId);
    if (error) fail('Sınıf silme', error);
    return true;
  }
  writeLocal(LOCAL_CLASSES_KEY, readLocal(LOCAL_CLASSES_KEY).filter(c => c.id !== classId));
  return true;
}

// ==========================================
// STUDENTS (ÖĞRENCİLER)
// ==========================================
export async function getStudents(classId = null) {
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase.from('students').select('*').order('name', { ascending: true });
    if (classId) {
      query = query.eq('class_id', classId);
    }
    const { data, error } = await query;
    if (error) fail('Öğrencileri yükleme', error);
    return data || [];
  }

  const list = readLocal(LOCAL_STUDENTS_KEY);
  if (classId) {
    return list.filter(s => s.class_id === classId);
  }
  return list;
}

export async function addStudent(studentData) {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('students').insert({
      name: studentData.name,
      class_id: studentData.class_id,
      class_name: studentData.class_name,
      phone: studentData.phone || '',
      parent_name: studentData.parent_name || '',
      parent_phone: studentData.parent_phone || '',
      registered_at: studentData.registered_at || new Date().toISOString().split('T')[0],
      notes: studentData.notes || ''
    }).select().single();
    if (error) fail('Öğrenci ekleme', error);
    return data;
  }

  const newStudent = {
    id: 's_' + Date.now(),
    ...studentData,
    created_at: new Date().toISOString()
  };
  const list = readLocal(LOCAL_STUDENTS_KEY);
  list.push(newStudent);
  writeLocal(LOCAL_STUDENTS_KEY, list);
  return newStudent;
}

export async function updateStudent(id, studentData) {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.from('students').update({
      name: studentData.name,
      class_id: studentData.class_id,
      class_name: studentData.class_name,
      phone: studentData.phone || '',
      parent_name: studentData.parent_name || '',
      parent_phone: studentData.parent_phone || '',
      registered_at: studentData.registered_at,
      notes: studentData.notes || ''
    }).eq('id', id).select().single();
    if (error) fail('Öğrenci güncelleme', error);
    return data;
  }

  const list = readLocal(LOCAL_STUDENTS_KEY);
  const index = list.findIndex(s => s.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...studentData };
    writeLocal(LOCAL_STUDENTS_KEY, list);
    return list[index];
  }
  return null;
}

export async function deleteStudent(id) {
  const supabase = getSupabase();
  if (supabase) {
    // Yoklama ve ödeme kayıtları veritabanında ON DELETE CASCADE ile silinir
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) fail('Öğrenci silme', error);
    return true;
  }

  writeLocal(LOCAL_STUDENTS_KEY, readLocal(LOCAL_STUDENTS_KEY).filter(s => s.id !== id));
  writeLocal(LOCAL_PAYMENTS_KEY, readLocal(LOCAL_PAYMENTS_KEY).filter(p => p.student_id !== id));
  writeLocal(LOCAL_ATTENDANCE_KEY, readLocal(LOCAL_ATTENDANCE_KEY).filter(a => a.student_id !== id));
  return true;
}

// ==========================================
// ATTENDANCE (YOKLAMA)
// ==========================================
export async function getAttendance(classId, dateStr) {
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase.from('attendance').select('*');
    if (classId) query = query.eq('class_id', classId);
    if (dateStr) query = query.eq('date', dateStr);
    const { data, error } = await query;
    if (error) fail('Yoklamayı yükleme', error);
    return data || [];
  }

  return readLocal(LOCAL_ATTENDANCE_KEY).filter(a => {
    if (classId && a.class_id !== classId) return false;
    if (dateStr && a.date !== dateStr) return false;
    return true;
  });
}

export async function saveAttendanceBatch(records) {
  // records: array of { class_id, student_id, date, status, notes }
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('attendance').upsert(records, {
      onConflict: 'student_id,date'
    });
    if (error) fail('Yoklama kaydetme', error);
    return true;
  }

  const list = readLocal(LOCAL_ATTENDANCE_KEY);
  for (const rec of records) {
    const idx = list.findIndex(item => item.student_id === rec.student_id && item.date === rec.date);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...rec };
    } else {
      list.push({ id: 'att_' + Date.now() + Math.random(), ...rec });
    }
  }
  writeLocal(LOCAL_ATTENDANCE_KEY, list);
  return true;
}

// ==========================================
// PAYMENTS (ÖDEMELER)
// ==========================================
export async function getPayments(year) {
  const targetYear = Number(year) || new Date().getFullYear();
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('year', targetYear);
    if (error) fail('Ödemeleri yükleme', error);
    return data || [];
  }

  return readLocal(LOCAL_PAYMENTS_KEY).filter(p => p.year === targetYear);
}

export async function togglePaymentStatus(studentId, month, year, desiredState, extraInfo = {}) {
  // desiredState: boolean (true for paid, false for unpaid)
  const paidDate = desiredState ? (extraInfo.paid_date || new Date().toISOString().split('T')[0]) : null;
  const amount = desiredState ? (Number(extraInfo.amount) || 0) : 0;
  const note = desiredState ? (extraInfo.note || '') : '';

  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from('payments').upsert({
      student_id: studentId,
      month,
      year,
      is_paid: desiredState,
      paid_date: paidDate,
      amount,
      note
    }, {
      onConflict: 'student_id,month,year'
    });
    if (error) fail('Ödeme kaydetme', error);
    return true;
  }

  const list = readLocal(LOCAL_PAYMENTS_KEY);
  const idx = list.findIndex(p => p.student_id === studentId && p.month === month && p.year === year);

  if (idx !== -1) {
    list[idx] = { ...list[idx], is_paid: desiredState, paid_date: paidDate, amount, note };
  } else {
    list.push({
      id: 'p_' + Date.now() + Math.random(),
      student_id: studentId,
      month,
      year,
      is_paid: desiredState,
      paid_date: paidDate,
      amount,
      note
    });
  }
  writeLocal(LOCAL_PAYMENTS_KEY, list);
  return true;
}

// ==========================================
// MIGRATE LOCAL TO SUPABASE
// ==========================================
export async function migrateLocalToSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase bağlı değil.');

  const localClasses = readLocal(LOCAL_CLASSES_KEY);
  const localStudents = readLocal(LOCAL_STUDENTS_KEY);
  const localPayments = readLocal(LOCAL_PAYMENTS_KEY);

  const check = (error, action) => {
    if (error) throw new Error(`${action}: ${error.message}`);
  };

  // 1. Sınıflar: ada göre benzersiz (classes.name unique index'i gerekir)
  if (localClasses.length) {
    const { error } = await supabase.from('classes').upsert(
      localClasses.map(c => ({ name: c.name, category: c.category, monthly_fee: Number(c.monthly_fee) || 0 })),
      { onConflict: 'name', ignoreDuplicates: true }
    );
    check(error, 'Sınıflar aktarılamadı');
  }

  const { data: dbClasses, error: classErr } = await supabase.from('classes').select('id, name');
  check(classErr, 'Sınıflar okunamadı');
  const classMap = new Map((dbClasses || []).map(c => [c.name, c.id]));

  // 2. Öğrenciler: aynı ad + sınıf varsa tekrar eklenmez
  const { data: dbStudents, error: stdErr } = await supabase.from('students').select('id, name, class_name');
  check(stdErr, 'Öğrenciler okunamadı');
  const studentKey = (name, className) => `${name}||${className}`;
  const studentMap = new Map();
  const existing = new Map((dbStudents || []).map(s => [studentKey(s.name, s.class_name), s.id]));

  for (const s of localStudents) {
    const key = studentKey(s.name, s.class_name);
    if (existing.has(key)) {
      studentMap.set(s.id, existing.get(key));
      continue;
    }
    const { data: inserted, error } = await supabase.from('students').insert({
      name: s.name,
      class_id: classMap.get(s.class_name) || null,
      class_name: s.class_name,
      phone: s.phone,
      parent_name: s.parent_name,
      parent_phone: s.parent_phone,
      registered_at: s.registered_at,
      notes: s.notes
    }).select().single();
    check(error, `Öğrenci aktarılamadı (${s.name})`);
    studentMap.set(s.id, inserted.id);
    existing.set(key, inserted.id);
  }

  // 3. Ödemeler: (öğrenci, ay, yıl) üzerinden upsert
  const paymentRows = localPayments
    .filter(p => studentMap.has(p.student_id))
    .map(p => ({
      student_id: studentMap.get(p.student_id),
      month: p.month,
      year: p.year,
      is_paid: p.is_paid,
      paid_date: p.paid_date,
      amount: p.amount,
      note: p.note
    }));
  if (paymentRows.length) {
    const { error } = await supabase.from('payments').upsert(paymentRows, { onConflict: 'student_id,month,year' });
    check(error, 'Ödemeler aktarılamadı');
  }

  return true;
}
