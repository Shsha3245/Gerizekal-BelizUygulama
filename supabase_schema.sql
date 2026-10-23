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
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

-- 5. Sistem Ayarları (Admin Şifresi vb.)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- Anonim anahtar ile okuma ve yazmaya izin verir
-- ==========================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Herkesin (Anon key ile) okuma ve yazabilmesi için açık politikalar
DROP POLICY IF EXISTS "Public access for classes" ON public.classes;
CREATE POLICY "Public access for classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for students" ON public.students;
CREATE POLICY "Public access for students" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for attendance" ON public.attendance;
CREATE POLICY "Public access for attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for payments" ON public.payments;
CREATE POLICY "Public access for payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for app_settings" ON public.app_settings;
CREATE POLICY "Public access for app_settings" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

-- ==========================================================
-- BAŞLANGIÇ VERİLERİ (Örnek Sınıflar)
-- ==========================================================
INSERT INTO public.classes (name, category) VALUES
    ('13.00 Sınıfı', 'normal'),
    ('14.30 Sınıfı', 'normal'),
    ('16.00 Sınıfı', 'normal'),
    ('(G) Sınıf 1', 'belediye'),
    ('(G) Sınıf 2', 'belediye'),
    ('(İl) Sınıf 1', 'belediye')
ON CONFLICT DO NOTHING;
