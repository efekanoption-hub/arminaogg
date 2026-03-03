-- =============================================
-- ARMİNA - Supabase Veritabanı Kurulum SQL'i
-- Supabase > SQL Editor'a yapıştırın ve çalıştırın
-- =============================================

-- 1. PROFILES tablosu
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  tc_no TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  height INTEGER,
  weight INTEGER,
  certificate TEXT,
  qr_code_id TEXT UNIQUE,
  avatar_url TEXT,
  fcm_token TEXT,
  role TEXT DEFAULT 'personel' CHECK (role IN ('personel', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EVENTS tablosu
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'pasif')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. APPLICATIONS tablosu
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('katılıyor', 'katılmıyor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =============================================
-- RLS (Row Level Security) Politikaları
-- =============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi profilini okuyabilir" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Kullanıcı kendi profilini oluşturabilir" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin tüm profilleri okuyabilir" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Events RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes aktif etkinlikleri okuyabilir" ON public.events
  FOR SELECT USING (status = 'aktif' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Sadece admin etkinlik oluşturabilir" ON public.events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sadece admin etkinlik güncelleyebilir" ON public.events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Sadece admin etkinlik silebilir" ON public.events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Applications RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcı kendi başvurularını görebilir" ON public.applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi başvurusunu oluşturabilir" ON public.applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi başvurusunu güncelleyebilir" ON public.applications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin tüm başvuruları görebilir" ON public.applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- Admin kullanıcısı oluşturma (Authentication'da 
-- admin@arminaapp.com / arminaadmin1 ile kayıt ettikten sonra çalıştırın)
-- Kendi admin user ID'nizi auth.users tablosundan alın
-- =============================================

-- Örnek: (kendi admin UUID'nizi buraya yazın)
-- UPDATE public.profiles SET role = 'admin' WHERE tc_no = 'ADMIN_TC_NO';

-- =============================================
-- Realtime aktifleştirme (her tablo için)
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
