import { getSupabase } from './supabase';
import { DEFAULT_PAYMENT_AMOUNT } from './defaultData';

// Eski (yerel) sürümden kalan veriler sadece Supabase'e aktarım için okunur.
const LOCAL_CLASSES_KEY = 'beliz_classes_v1';
const LOCAL_STUDENTS_KEY = 'beliz_students_v1';
const LOCAL_PAYMENTS_KEY = 'beliz_payments_v1';

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase yapılandırılmamış. Lütfen Supabase bağlantı bilgilerini girin.');
  }
  return supabase;
}

function check({ data, error }) {
  if (error) {
    throw new Error(error.message || 'Veritabanı hatası oluştu.');
  }
  return data;
}

const today = () => new Date().toISOString().split('T')[0];

// ==========================================
// CLASSES (SINIFLAR)
// ==========================================
export async function getClasses() {
  const supabase = requireSupabase();
  return check(await supabase.from('classes').select('*').order('created_at', { ascending: true })) || [];
}

export async function addClass({ name, category }) {
  const supabase = requireSupabase();
  return check(await supabase.from('classes').insert({ name, category }).select().single());
}

export async function deleteClass(classId) {
  const supabase = requireSupabase();
  check(await supabase.from('classes').delete().eq('id', classId));
  return true;
}

// ==========================================
// STUDENTS (ÖĞRENCİLER)
// ==========================================
export async function getStudents(classId = null) {
  const supabase = requireSupabase();
  let query = supabase.from('students').select('*').order('name', { ascending: true });
  if (classId) {
    query = query.eq('class_id', classId);
  }
  return check(await query) || [];
}

export async function addStudent(studentData) {
  const supabase = requireSupabase();
  return check(await supabase.from('students').insert({
    name: studentData.name,
    class_id: studentData.class_id,
    class_name: studentData.class_name,
    phone: studentData.phone || '',
    parent_name: studentData.parent_name || '',
    parent_phone: studentData.parent_phone || '',
    registered_at: studentData.registered_at || today(),
    notes: studentData.notes || ''
  }).select().single());
}

export async function updateStudent(id, studentData) {
  const supabase = requireSupabase();
  return check(await supabase.from('students').update({
    name: studentData.name,
    class_id: studentData.class_id,
    class_name: studentData.class_name,
    phone: studentData.phone || '',
    parent_name: studentData.parent_name || '',
    parent_phone: studentData.parent_phone || '',
    registered_at: studentData.registered_at,
    notes: studentData.notes || ''
  }).eq('id', id).select().single());
}

export async function deleteStudent(id) {
  const supabase = requireSupabase();
  check(await supabase.from('students').delete().eq('id', id));
  return true;
}

// ==========================================
// ATTENDANCE (YOKLAMA)
// ==========================================
export async function getAttendance(classId, dateStr) {
  const supabase = requireSupabase();
  let query = supabase.from('attendance').select('*');
  if (classId) query = query.eq('class_id', classId);
  if (dateStr) query = query.eq('date', dateStr);
  return check(await query) || [];
}

export async function saveAttendanceBatch(records) {
  // records: array of { class_id, student_id, date, status, notes }
  const supabase = requireSupabase();
  check(await supabase.from('attendance').upsert(records, {
    onConflict: 'student_id,date'
  }));
  return true;
}

// ==========================================
// PAYMENTS (ÖDEMELER)
// ==========================================
export async function getPayments(year = new Date().getFullYear()) {
  const supabase = requireSupabase();
  return check(await supabase.from('payments').select('*').eq('year', year)) || [];
}

export async function togglePaymentStatus(studentId, month, year, desiredState, extraInfo = {}) {
  // desiredState: boolean (true for paid, false for unpaid)
  const paidDate = desiredState ? (extraInfo.paid_date || today()) : null;
  const amount = desiredState ? (extraInfo.amount || DEFAULT_PAYMENT_AMOUNT) : 0;
  const note = desiredState ? (extraInfo.note || '') : '';

  const supabase = requireSupabase();
  check(await supabase.from('payments').upsert({
    student_id: studentId,
    month,
    year,
    is_paid: desiredState,
    paid_date: paidDate,
    amount,
    note
  }, {
    onConflict: 'student_id,month,year'
  }));
  return true;
}

// ==========================================
// MIGRATE LOCAL TO SUPABASE
// ==========================================
export async function migrateLocalToSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase bağlı değil.');

  const localClasses = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY) || '[]');
  const localStudents = JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  const localPayments = JSON.parse(localStorage.getItem(LOCAL_PAYMENTS_KEY) || '[]');

  // 1. Upload classes
  for (const c of localClasses) {
    check(await supabase.from('classes').upsert({
      name: c.name,
      category: c.category
    }, { onConflict: 'name' }));
  }

  // Fetch updated classes to link IDs
  const dbClasses = check(await supabase.from('classes').select('*'));
  const classMap = new Map();
  dbClasses?.forEach(c => classMap.set(c.name, c.id));

  // 2. Upload students
  const studentMap = new Map();
  for (const s of localStudents) {
    const classId = classMap.get(s.class_name) || null;
    const insertedStudent = check(await supabase.from('students').insert({
      name: s.name,
      class_id: classId,
      class_name: s.class_name,
      phone: s.phone,
      parent_name: s.parent_name,
      parent_phone: s.parent_phone,
      registered_at: s.registered_at,
      notes: s.notes
    }).select().single());

    if (insertedStudent) {
      studentMap.set(s.id, insertedStudent.id);
    }
  }

  // 3. Upload payments
  for (const p of localPayments) {
    const newStudentId = studentMap.get(p.student_id);
    if (newStudentId) {
      check(await supabase.from('payments').upsert({
        student_id: newStudentId,
        month: p.month,
        year: p.year,
        is_paid: p.is_paid,
        paid_date: p.paid_date,
        amount: p.amount,
        note: p.note
      }, { onConflict: 'student_id,month,year' }));
    }
  }

  return true;
}
