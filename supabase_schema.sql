-- ==========================================================
-- BELİZ SİSTEMİ - SUPABASE VERİTABANI ŞEMASI
-- Bu SQL kodlarını Supabase Dashboard -> "SQL Editor" kısmına
-- yapıştırıp "Run" butonuna basarak tabloları oluşturabilirsiniz.
-- ==========================================================

-- 1. Sınıflar Tablosu (Normal ve Belediye)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('normal', 'belediye')),
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Eski kurulumlar için: sınıf bazlı aylık ücret kolonu
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;

-- Aynı isimli tekrar eden sınıfları birleştir (öğrenci ve yoklama kayıtları korunur)
WITH ranked AS (
    SELECT id, first_value(id) OVER (PARTITION BY name ORDER BY created_at, id) AS keep_id
    FROM public.classes
)
UPDATE public.students s SET class_id = r.keep_id
FROM ranked r WHERE s.class_id = r.id AND r.id <> r.keep_id;

WITH ranked AS (
    SELECT id, first_value(id) OVER (PARTITION BY name ORDER BY created_at, id) AS keep_id
    FROM public.classes
)
UPDATE public.attendance a SET class_id = r.keep_id
FROM ranked r WHERE a.class_id = r.id AND r.id <> r.keep_id;

WITH ranked AS (
    SELECT id, first_value(id) OVER (PARTITION BY name ORDER BY created_at, id) AS keep_id
    FROM public.classes
)
DELETE FROM public.classes c USING ranked r WHERE c.id = r.id AND r.id <> r.keep_id;

-- Sınıf adı benzersiz olmalı (seed ve aktarım için çakışma hedefi)
CREATE UNIQUE INDEX IF NOT EXISTS classes_name_key ON public.classes (name);

-- 2. Öğrenciler Tablosu
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name TEXT NOT NULL,
    phone TEXT,
    parent_name TEXT,
    parent_phone TEXT,
    registered_at DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Yoklama Tablosu
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('geldi', 'gelmedi', 'izinli')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_attendance_date UNIQUE (student_id, date)
);

-- 4. Ödemeler Tablosu (Aylık Ödeme Takibi)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date TIMESTAMPTZ,
    amount NUMERIC(10, 2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_month_payment UNIQUE (student_id, month, year)
);

-- 5. Sistem Ayarları (şifre ASLA burada tutulmaz; giriş Supabase Auth ile yapılır)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Sadece giriş yapmış (authenticated) yönetici erişebilir.
-- Anonim (anon) anahtar ile hiçbir veriye erişilemez.
-- ÖNEMLİ: Supabase Dashboard -> Authentication -> Sign In / Providers
-- bölümünden "Allow new users to sign up" seçeneğini KAPATIN ve
-- yönetici kullanıcıyı Dashboard'dan elle oluşturun.
-- ==========================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Eski açık politikaları kaldır
DROP POLICY IF EXISTS "Public access for classes" ON public.classes;
DROP POLICY IF EXISTS "Public access for students" ON public.students;
DROP POLICY IF EXISTS "Public access for attendance" ON public.attendance;
DROP POLICY IF EXISTS "Public access for payments" ON public.payments;
DROP POLICY IF EXISTS "Public access for app_settings" ON public.app_settings;
DROP POLICY IF EXISTS "Public app_settings" ON public.app_settings;

-- Eski sürümde düz metin saklanan yönetici şifresini sil
DELETE FROM public.app_settings WHERE key = 'admin_password';

REVOKE ALL ON public.classes, public.students, public.attendance, public.payments, public.app_settings FROM anon;

DROP POLICY IF EXISTS "Authenticated access for classes" ON public.classes;
CREATE POLICY "Authenticated access for classes" ON public.classes
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated access for students" ON public.students;
CREATE POLICY "Authenticated access for students" ON public.students
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated access for attendance" ON public.attendance;
CREATE POLICY "Authenticated access for attendance" ON public.attendance
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated access for payments" ON public.payments;
CREATE POLICY "Authenticated access for payments" ON public.payments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated access for app_settings" ON public.app_settings;
CREATE POLICY "Authenticated access for app_settings" ON public.app_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- BAŞLANGIÇ VERİLERİ (Örnek Sınıflar)
-- ==========================================================
INSERT INTO public.classes (name, category, monthly_fee) VALUES
    ('13.00 Sınıfı', 'normal', 1500),
    ('14.30 Sınıfı', 'normal', 1500),
    ('16.00 Sınıfı', 'normal', 1500),
    ('(G) Sınıf 1', 'belediye', 1500),
    ('(G) Sınıf 2', 'belediye', 1500),
    ('(İl) Sınıf 1', 'belediye', 1500)
ON CONFLICT (name) DO NOTHING;
