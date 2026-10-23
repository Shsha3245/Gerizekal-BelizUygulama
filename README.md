# BELİZ - Dans Okulu Yönetim Paneli

Sınıf, öğrenci, yoklama ve aylık ödeme takibi için tek yöneticili bir web uygulaması (React + Vite + Supabase).

## Gereksinimler

- Node.js 20+ ve npm
- Bir [Supabase](https://supabase.com) projesi (ücretsiz plan yeterli)
- (Yayın için) Bir [Vercel](https://vercel.com) hesabı

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env   # değerleri doldurun
npm run dev
```

Supabase bilgileri girilmezse uygulama **yerel modda** (sadece o tarayıcının localStorage'ı, giriş yok, demo amaçlı) çalışır.
Supabase yapılandırıldığında yerel kayda **asla** düşülmez; bir işlem başarısız olursa ekranda hata mesajı gösterilir.

## Supabase kurulumu

1. Supabase'de yeni proje oluşturun.
2. **SQL Editor** içinde `supabase_schema.sql` dosyasının tamamını çalıştırın. Dosya tekrar çalıştırılabilir (idempotent): tabloları, `classes.monthly_fee` kolonunu, `classes.name` benzersiz indeksini, RLS politikalarını ve başlangıç sınıflarını oluşturur; tekrar çalıştırınca sınıflar çoğalmaz.
3. **Authentication → Sign In / Providers** bölümünde **"Allow new users to sign up"** seçeneğini **kapatın**.
4. **Authentication → Users → Add user** ile yönetici kullanıcıyı (e-posta + güçlü şifre, "Auto Confirm User" açık) oluşturun.
5. **Project Settings → API** sayfasından `Project URL` ve `anon public` anahtarını alın.

### Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase proje URL'si |
| `VITE_SUPABASE_ANON_KEY` | Supabase `anon` (public) anahtarı |

Asla `service_role` anahtarını frontend'e koymayın.

### Giriş modeli

Yönetici girişi Supabase Auth (e-posta + şifre) ile yapılır. Tüm tablolarda RLS açıktır ve politikalar yalnızca `authenticated` role izin verir; anonim anahtar ile veri okunamaz/yazılamaz. Şifre değiştirme Supabase Auth üzerinden yapılır. Eski sürümdeki `app_settings.admin_password` kaydı şema çalıştırılınca silinir.

## Yayına alma (Vercel)

1. Repoyu Vercel'e **Import** edin (Framework: Vite; build: `npm run build`; output: `dist`).
2. **Settings → Environment Variables** altında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini girin.
3. Deploy edin ve yönetici e-posta/şifresi ile giriş yaparak test edin.

## Güvenlik notları

- Kayıt (sign-up) kapalı olmalı; aksi halde herkes hesap açıp verilere erişebilir.
- Öğrenci/veli telefon bilgileri kişisel veridir (KVKK); repoyu private tutun ve yönetici şifresini paylaşmayın.
- `.env` dosyasını commit etmeyin.
- Şifre veritabanında veya localStorage'da tutulmaz.

## Manuel doğrulama listesi

- [ ] Çıkış yapılmış durumda anon anahtar ile tablolar okunamıyor (boş/izin hatası)
- [ ] Doğru e-posta/şifre ile giriş çalışıyor, yanlışta hata gösteriliyor, giriş ekranında varsayılan şifre yok
- [ ] Ödeme çizelgesi güncel yılla açılıyor; yıl değiştirince tablo o yılın verisini gösteriyor
- [ ] Sınıfa ücret girilince, öğrencinin ödemesi tıklanınca tutar sınıf ücreti oluyor; sağ tık ile tutar değiştirilebiliyor
- [ ] Supabase bağlantısı koparken yapılan kayıt hata mesajı gösteriyor ve yerelde saklanmıyor
- [ ] `supabase_schema.sql` ikinci kez çalıştırılınca sınıflar çoğalmıyor
