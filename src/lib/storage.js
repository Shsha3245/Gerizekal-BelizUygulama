import { getSupabase } from './supabase';
import { DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_PAYMENTS } from './defaultData';

const LOCAL_CLASSES_KEY = 'beliz_classes_v1';
const LOCAL_STUDENTS_KEY = 'beliz_students_v1';
const LOCAL_ATTENDANCE_KEY = 'beliz_attendance_v1';
const LOCAL_PAYMENTS_KEY = 'beliz_payments_v1';
const LOCAL_ADMIN_PASS_KEY = 'beliz_admin_pass_v1';

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
  if (!localStorage.getItem(LOCAL_ADMIN_PASS_KEY)) {
    localStorage.setItem(LOCAL_ADMIN_PASS_KEY, 'admin123'); // Default admin password
  }
}

initLocalStorage();

// ==========================================
// ADMIN AUTH
// ==========================================
export async function verifyAdminPassword(password) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();
      if (!error && data?.value) {
        return data.value === password;
      }
    } catch {
      // fallback
    }
  }
  const stored = localStorage.getItem(LOCAL_ADMIN_PASS_KEY) || 'admin123';
  return stored === password;
}

export async function changeAdminPassword(newPassword) {
  localStorage.setItem(LOCAL_ADMIN_PASS_KEY, newPassword);
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('app_settings').upsert({
        key: 'admin_password',
        value: newPassword,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not sync password to Supabase:', e);
    }
  }
  return true;
}

// ==========================================
// CLASSES (SINIFLAR)
// ==========================================
export async function getClasses() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: true });
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getClasses error, fallback to local:', err);
    }
  }
  return JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY) || '[]');
}

export async function addClass({ name, category }) {
  const newClass = {
    id: 'c_' + Date.now(),
    name,
    category, // 'normal' or 'belediye'
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('classes').insert({
        name,
        category
      }).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase addClass error, fallback to local:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY) || '[]');
  list.push(newClass);
  localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(list));
  return newClass;
}

export async function deleteClass(classId) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('classes').delete().eq('id', classId);
    } catch (err) {
      console.warn('Supabase deleteClass error:', err);
    }
  }
  const list = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY) || '[]');
  const filtered = list.filter(c => c.id !== classId);
  localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(filtered));
  return true;
}

// ==========================================
// STUDENTS (ÖĞRENCİLER)
// ==========================================
export async function getStudents(classId = null) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('students').select('*').order('name', { ascending: true });
      if (classId) {
        query = query.eq('class_id', classId);
      }
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getStudents error, fallback to local:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  if (classId) {
    return list.filter(s => s.class_id === classId);
  }
  return list;
}

export async function addStudent(studentData) {
  const newStudent = {
    id: 's_' + Date.now(),
    ...studentData,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  if (supabase) {
    try {
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
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase addStudent error, fallback to local:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  list.push(newStudent);
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(list));
  return newStudent;
}

export async function updateStudent(id, studentData) {
  const supabase = getSupabase();
  if (supabase) {
    try {
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
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase updateStudent error:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  const index = list.findIndex(s => s.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...studentData };
    localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(list));
    return list[index];
  }
  return null;
}

export async function deleteStudent(id) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('students').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteStudent error:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_STUDENTS_KEY) || '[]');
  const filtered = list.filter(s => s.id !== id);
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(filtered));

  // Also remove their attendance & payments in local
  const payments = JSON.parse(localStorage.getItem(LOCAL_PAYMENTS_KEY) || '[]');
  localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(payments.filter(p => p.student_id !== id)));

  const attendance = JSON.parse(localStorage.getItem(LOCAL_ATTENDANCE_KEY) || '[]');
  localStorage.setItem(LOCAL_ATTENDANCE_KEY, JSON.stringify(attendance.filter(a => a.student_id !== id)));

  return true;
}

// ==========================================
// ATTENDANCE (YOKLAMA)
// ==========================================
export async function getAttendance(classId, dateStr) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('attendance').select('*');
      if (classId) query = query.eq('class_id', classId);
      if (dateStr) query = query.eq('date', dateStr);
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getAttendance error:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_ATTENDANCE_KEY) || '[]');
  return list.filter(a => {
    let match = true;
    if (classId && a.class_id !== classId) match = false;
    if (dateStr && a.date !== dateStr) match = false;
    return match;
  });
}

export async function saveAttendanceBatch(records) {
  // records: array of { class_id, student_id, date, status, notes }
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('attendance').upsert(records, {
        onConflict: 'student_id,date'
      });
      if (error) console.warn('Supabase attendance upsert error:', error);
    } catch (err) {
      console.warn('Supabase batch attendance err:', err);
    }
  }

  // Update local storage
  const list = JSON.parse(localStorage.getItem(LOCAL_ATTENDANCE_KEY) || '[]');
  for (const rec of records) {
    const idx = list.findIndex(item => item.student_id === rec.student_id && item.date === rec.date);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...rec };
    } else {
      list.push({ id: 'att_' + Date.now() + Math.random(), ...rec });
    }
  }
  localStorage.setItem(LOCAL_ATTENDANCE_KEY, JSON.stringify(list));
  return true;
}

// ==========================================
// PAYMENTS (ÖDEMELER)
// ==========================================
export async function getPayments(year = 2025) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('year', year);
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase getPayments error:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_PAYMENTS_KEY) || '[]');
  return list.filter(p => p.year === year);
}

export async function togglePaymentStatus(studentId, month, year, desiredState, extraInfo = {}) {
  // desiredState: boolean (true for paid, false for unpaid)
  const paidDate = desiredState ? (extraInfo.paid_date || new Date().toISOString().split('T')[0]) : null;
  const amount = desiredState ? (extraInfo.amount || 1500) : 0;
  const note = desiredState ? (extraInfo.note || '') : '';

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('payments').upsert({
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
    } catch (err) {
      console.warn('Supabase togglePayment error:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem(LOCAL_PAYMENTS_KEY) || '[]');
  const idx = list.findIndex(p => p.student_id === studentId && p.month === month && p.year === year);
  
  if (idx !== -1) {
    list[idx] = {
      ...list[idx],
      is_paid: desiredState,
      paid_date: paidDate,
      amount,
      note
    };
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
  localStorage.setItem(LOCAL_PAYMENTS_KEY, JSON.stringify(list));
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
    await supabase.from('classes').upsert({
      name: c.name,
      category: c.category
    }, { onConflict: 'name' });
  }

  // Fetch updated classes to link IDs
  const { data: dbClasses } = await supabase.from('classes').select('*');
  const classMap = new Map();
  dbClasses?.forEach(c => classMap.set(c.name, c.id));

  // 2. Upload students
  const studentMap = new Map();
  for (const s of localStudents) {
    const classId = classMap.get(s.class_name) || s.class_id;
    const { data: insertedStudent } = await supabase.from('students').insert({
      name: s.name,
      class_id: classId,
      class_name: s.class_name,
      phone: s.phone,
      parent_name: s.parent_name,
      parent_phone: s.parent_phone,
      registered_at: s.registered_at,
      notes: s.notes
    }).select().single();

    if (insertedStudent) {
      studentMap.set(s.id, insertedStudent.id);
    }
  }

  // 3. Upload payments
  for (const p of localPayments) {
    const newStudentId = studentMap.get(p.student_id);
    if (newStudentId) {
      await supabase.from('payments').insert({
        student_id: newStudentId,
        month: p.month,
        year: p.year,
        is_paid: p.is_paid,
        paid_date: p.paid_date,
        amount: p.amount,
        note: p.note
      });
    }
  }

  return true;
}
