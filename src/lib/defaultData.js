// Varsayılan Başlangıç Verileri (Çiziminizdeki sınıflar ve örnek öğrenciler)

export const DEFAULT_CLASSES = [
  { id: 'c1', name: '13.00 Sınıfı', category: 'normal', monthly_fee: 1500 },
  { id: 'c2', name: '14.30 Sınıfı', category: 'normal', monthly_fee: 1500 },
  { id: 'c3', name: '16.00 Sınıfı', category: 'normal', monthly_fee: 1500 },
  { id: 'c4', name: '(G) Sınıf 1', category: 'belediye', monthly_fee: 1500 },
  { id: 'c5', name: '(G) Sınıf 2', category: 'belediye', monthly_fee: 1500 },
  { id: 'c6', name: '(İl) Sınıf 1', category: 'belediye', monthly_fee: 1500 },
];

export const DEFAULT_STUDENTS = [
  {
    id: 's1',
    name: 'Beliz Yılmaz',
    class_id: 'c1',
    class_name: '13.00 Sınıfı',
    phone: '0555 123 4567',
    parent_name: 'Ayşe Yılmaz',
    parent_phone: '0555 987 6543',
    registered_at: '2025-09-01',
    notes: 'Piyano ve Solfej öğrencisi'
  },
  {
    id: 's2',
    name: 'Mert Kaya',
    class_id: 'c1',
    class_name: '13.00 Sınıfı',
    phone: '0532 234 5678',
    parent_name: 'Ali Kaya',
    parent_phone: '0532 876 5432',
    registered_at: '2025-09-05',
    notes: ''
  },
  {
    id: 's3',
    name: 'Elif Demir',
    class_id: 'c1',
    class_name: '13.00 Sınıfı',
    phone: '0544 345 6789',
    parent_name: 'Fatma Demir',
    parent_phone: '0544 765 4321',
    registered_at: '2025-09-10',
    notes: ''
  },
  {
    id: 's4',
    name: 'Can Şahin',
    class_id: 'c2',
    class_name: '14.30 Sınıfı',
    phone: '0533 456 7890',
    parent_name: 'Murat Şahin',
    parent_phone: '0533 654 3210',
    registered_at: '2025-09-12',
    notes: ''
  },
  {
    id: 's5',
    name: 'Zeynep Çelik',
    class_id: 'c2',
    class_name: '14.30 Sınıfı',
    phone: '0505 567 8901',
    parent_name: 'Hülya Çelik',
    parent_phone: '0505 543 2109',
    registered_at: '2025-09-15',
    notes: ''
  },
  {
    id: 's6',
    name: 'Emir Arslan',
    class_id: 'c4',
    class_name: '(G) Sınıf 1',
    phone: '0551 678 9012',
    parent_name: 'Selin Arslan',
    parent_phone: '0551 432 1098',
    registered_at: '2025-09-01',
    notes: 'Belediye kursu burslu'
  },
  {
    id: 's7',
    name: 'Duru Öztürk',
    class_id: 'c4',
    class_name: '(G) Sınıf 1',
    phone: '0542 789 0123',
    parent_name: 'Ahmet Öztürk',
    parent_phone: '0542 321 0987',
    registered_at: '2025-09-03',
    notes: ''
  },
  {
    id: 's8',
    name: 'Kerem Yıldız',
    class_id: 'c5',
    class_name: '(G) Sınıf 2',
    phone: '0530 890 1234',
    parent_name: 'Mehmet Yıldız',
    parent_phone: '0530 210 9876',
    registered_at: '2025-09-08',
    notes: ''
  }
];

export const MONTHS = [
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran'
];

// Örnek ödemeler (Defter çiziminizdeki gibi Eylül/Ekim ödendi yeşil, Kasım ödenmedi kırmızı)
export const DEFAULT_PAYMENTS = [
  { id: 'p1', student_id: 's1', month: 'Eylül', year: 2025, is_paid: true, paid_date: '2025-09-05', amount: 1500, note: 'Havale' },
  { id: 'p2', student_id: 's1', month: 'Ekim', year: 2025, is_paid: true, paid_date: '2025-10-04', amount: 1500, note: 'Nakit' },
  { id: 'p3', student_id: 's1', month: 'Kasım', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },
  
  { id: 'p4', student_id: 's2', month: 'Eylül', year: 2025, is_paid: true, paid_date: '2025-09-07', amount: 1500, note: 'EFT' },
  { id: 'p5', student_id: 's2', month: 'Ekim', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },
  { id: 'p6', student_id: 's2', month: 'Kasım', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },

  { id: 'p7', student_id: 's3', month: 'Eylül', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },
  { id: 'p8', student_id: 's3', month: 'Ekim', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },
  { id: 'p9', student_id: 's3', month: 'Kasım', year: 2025, is_paid: false, paid_date: null, amount: 0, note: '' },

  { id: 'p10', student_id: 's6', month: 'Eylül', year: 2025, is_paid: true, paid_date: '2025-09-02', amount: 1000, note: 'Belediye payı' },
  { id: 'p11', student_id: 's6', month: 'Ekim', year: 2025, is_paid: true, paid_date: '2025-10-03', amount: 1000, note: '' },
  { id: 'p12', student_id: 's7', month: 'Eylül', year: 2025, is_paid: true, paid_date: '2025-09-05', amount: 1000, note: '' },
];
