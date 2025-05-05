Kişisel Finans Yönetim Sistemi
===========================

Bu uygulama, kişisel finans yönetimi için geliştirilmiş bir web servisidir. Flask ve MongoDB kullanılarak geliştirilmiştir.

Özellikler
---------
1. Kullanıcı Yönetimi
   - Kayıt olma
   - Giriş yapma
   - Profil yönetimi

2. Bütçe Yönetimi
   - Bütçe belirleme
   - Bütçe güncelleme
   - Düşük bütçe uyarıları (200 TL altı)

3. Fatura Yönetimi
   - Fatura ekleme
   - Fatura güncelleme
   - Fatura silme
   - Ödeme hatırlatmaları (2-3 gün önce)

4. Kredi Kartı Yönetimi
   - Kart ekleme
   - Kart güncelleme
   - Kart silme
   - Ödeme hatırlatmaları (2-3 gün önce)

5. Harcama Takibi
   - Harcama kaydı ekleme
   - Harcama özeti görüntüleme
   - Harcama kaydı silme

6. E-posta Bildirimleri
   - Ödeme bildirimleri
   - Fatura hatırlatmaları
   - Düşük bütçe uyarıları

API Endpoint'leri
---------------
1. Kullanıcı İşlemleri
   - POST /register - Yeni kullanıcı kaydı
   - POST /login - Kullanıcı girişi

2. Bütçe İşlemleri
   - POST /budget - Bütçe belirleme/güncelleme

3. Fatura İşlemleri
   - POST /bill - Fatura ekleme
   - PUT /bill - Fatura güncelleme
   - DELETE /bill - Fatura silme

4. Kredi Kartı İşlemleri
   - POST /credit-card - Kart ekleme
   - PUT /credit-card - Kart güncelleme
   - DELETE /credit-card - Kart silme

5. Harcama İşlemleri
   - POST /spending-log - Harcama kaydı ekleme
   - GET /spending-summary - Harcama özeti görüntüleme
   - DELETE /spending-log - Harcama kaydı silme

6. Ödeme İşlemleri
   - POST /make-payment - Ödeme yapma

7. Zamanlanmış Görevler
   - POST /run-daily-checks - Günlük kontrolleri çalıştırma

Kurulum
-------
1. Gerekli paketleri yükleyin:
   pip install -r requirements.txt

2. .env dosyasını oluşturun ve gerekli değişkenleri ayarlayın:
   MONGODB_URI=mongodb://localhost:27017/
   MAIL_SERVER=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_DEFAULT_SENDER=your-email@gmail.com

3. Uygulamayı başlatın:
   python app.py

Notlar
-----
- E-posta bildirimleri için Gmail SMTP kullanılmaktadır
- Zamanlanmış görevler her 24 saatte bir çalışır
- Bütçe uyarıları 200 TL altı için tetiklenir
- Fatura ve kart ödemeleri için hatırlatmalar 2-3 gün önce gönderilir 