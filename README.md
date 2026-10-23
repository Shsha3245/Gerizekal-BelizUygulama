# BELİZ - Öğrenci Yoklama ve Ödeme Takip Uygulaması

Dans okulu öğrencilerinin yoklamasını ve aylık ödemelerini takip etmek için hazırlanmış, tek kullanıcılı (öğretmen) bir uygulamadır.

**Teknolojiler:** React 19, Vite, Tailwind CSS, Supabase (Veritabanı + Auth)

## Yerelde Çalıştırma

```bash
npm install
cp .env.example .env   # değerleri doldurun
npm run dev
```

Diğer komutlar: `npm run build`, `npm run lint`, `npm run preview`.

## Supabase Kurulumu

1. [supabase.com](https://supabase.com) üzerinde ücretsiz bir proje oluşturun.
2. **SQL Editor** bölümünü açın, bu repodaki `supabase_schema.sql` dosyasının içeriğini yapıştırıp **Run** deyin.
   Bu işlem tabloları oluşturur ve RLS politikalarını yalnızca giriş yapmış (`authenticated`) kullanıcıya erişim verecek şekilde ayarlar.
   Eski sürümden kalan `app_settings` tablosu (düz metin şifre) silinir.
3. **Project Settings > API** sayfasından **Project URL** ve **anon public key** değerlerini alın.
   `service_role` anahtarını asla uygulamada kullanmayın.

### Tek kullanıcı oluşturma (Auth)

1. **Authentication > Users > Add user > Create new user** ile öğretmenin e-posta ve şifresini girin (**Auto Confirm User** işaretli olsun).
2. **Authentication > Sign In / Providers** (veya **Settings**) bölümünde **Allow new users to sign up** seçeneğini **kapatın**. Böylece başka kimse hesap açamaz.
3. Uygulamada bu e-posta ve şifre ile giriş yapılır. Şifre, uygulamadaki ayarlar menüsünden değiştirilebilir.

## Ortam Değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Bu değişkenler tanımlı değilse giriş ekranında uyarı gösterilir ve giriş yapılamaz.

## Vercel ile Yayına Alma

1. [vercel.com](https://vercel.com) üzerinde GitHub hesabınızla giriş yapın.
2. **Add New > Project** ile bu repoyu seçin.
3. Framework: **Vite**, Build Command: `npm run build`, Output Directory: `dist`.
4. **Environment Variables** bölümüne `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` değerlerini ekleyin.
5. **Deploy** deyin. Sonrasında her push otomatik olarak yayına alınır.

## Notlar

- Supabase ücretsiz planında proje 1 hafta kullanılmazsa duraklatılabilir; Dashboard'dan tekrar başlatabilirsiniz.
- Veriler yalnızca Supabase'de tutulur. Bir hata olduğunda uygulama sessizce yerel depoya yazmaz, hatayı kullanıcıya gösterir.
- Ödeme çizelgesinde yıl seçilebilir; varsayılan yıl içinde bulunulan yıldır.
