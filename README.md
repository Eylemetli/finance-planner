# Finansal Yönetim Sistemi

## Proje Açıklaması
Bu proje, kullanıcıların kişisel finanslarını yönetmelerine yardımcı olan bir web uygulamasıdır. Sistem, kullanıcıların bütçelerini takip etmelerine, kredi kartı işlemlerini yönetmelerine, faturalarını takip etmelerine ve günlük harcamalarını kategorize etmelerine olanak tanır. Tüm veriler MongoDB veritabanında güvenli bir şekilde saklanır.

### Temel Özellikler
- Kullanıcı kayıt ve giriş sistemi
- Bütçe yönetimi
- Kredi kartı takibi
- Fatura yönetimi
- Harcama günlüğü ve kategorizasyon
- Harcama raporlama ve analiz

## Kullanılan Teknolojiler
- **Backend**: Python Flask
- **Veritabanı**: MongoDB
- **Kimlik Doğrulama**: Bcrypt
- **API Güvenliği**: CORS
- **Ortam Değişkenleri**: python-dotenv
- **E-posta Bildirimleri**: Flask-Mail

## Kurulum Adımları

1. Gerekli paketleri yükleyin:
```bash
pip install flask flask-cors pymongo bcrypt python-dotenv flask-mail
```

2. MongoDB'yi başlatın:
```bash
mongod
```

3. `.env` dosyasını oluşturun:
```env
MONGODB_URI=mongodb://localhost:27017/
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

4. Gmail Hesap Ayarları:
   - Gmail hesabınızda "2 Adımlı Doğrulama"yı etkinleştirin
   - "Uygulama Şifreleri" bölümünden yeni bir şifre oluşturun
   - Bu şifreyi `.env` dosyasındaki `MAIL_PASSWORD` değişkenine ekleyin

5. Uygulamayı başlatın:
```bash
python app.py
```

## E-posta Bildirimleri

Sistem aşağıdaki durumlarda otomatik e-posta bildirimleri gönderir:

1. **Ödeme Bildirimleri**:
   - Fatura ödemeleri
   - Kredi kartı ödemeleri
   - Kalan bütçe bilgisi

2. **Fatura Hatırlatmaları**:
   - Ödenmemiş faturalar için son ödeme tarihinden 2 gün önce hatırlatma
   - Geçmiş ödemeler için günlük hatırlatma
   - Bildirimler, ödeme yapılana kadar devam eder
   - Kullanıcılar her fatura için bildirimleri kapatabilir

3. **Bütçe Uyarıları**:
   - Bütçe 200 TL'nin altına düştüğünde uyarı

### Bildirim Ayarları

Her fatura için bildirim ayarları aşağıdaki gibi yönetilebilir:

1. **Bildirimleri Kapatma**:
   ```bash
   curl -X PUT http://localhost:5000/bill \
     -H "Content-Type: application/json" \
     -H "X-User-Email: kullanici@example.com" \
     -d '{
       "email": "kullanici@example.com",
       "bill_name": "Elektrik",
       "is_notification_enabled": false
     }'
   ```

2. **Bildirimleri Açma**:
   ```bash
   curl -X PUT http://localhost:5000/bill \
     -H "Content-Type: application/json" \
     -H "X-User-Email: kullanici@example.com" \
     -d '{
       "email": "kullanici@example.com",
       "bill_name": "Elektrik",
       "is_notification_enabled": true
     }'
   ```

### Test Endpoint'i

Bildirim sistemini test etmek için:

```bash
curl -X POST http://localhost:5000/test-mail \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com"
  }'
```

### Günlük Kontrolleri Çalıştırma

Günlük kontrolleri manuel olarak çalıştırmak için:

```bash
curl -X POST http://localhost:5000/run-daily-checks
```

### Örnek Ödeme İsteği

```bash
curl -X POST http://localhost:5000/make-payment \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "email": "kullanici@example.com",
    "odeme_turu": "bill",
    "isim": "Elektrik",
    "odeme_tutari": 250
  }'
```

## API Endpoints

### Kullanıcı İşlemleri
- `POST /register`: Yeni kullanıcı kaydı
- `POST /login`: Kullanıcı girişi
- `GET /home/messages`: Dinamik anasayfa mesajları

### Bütçe İşlemleri
- `POST /budget`: Bütçe oluşturma/güncelleme

### Kredi Kartı İşlemleri
- `POST /credit-card`: Kredi kartı ekleme
- `PUT /credit-card`: Kredi kartı güncelleme
- `DELETE /credit-card`: Kredi kartı silme

### Fatura İşlemleri
- `POST /bill`: Fatura ekleme
- `PUT /bill`: Fatura güncelleme
- `DELETE /bill`: Fatura silme

### Harcama Günlüğü İşlemleri
- `POST /spending-log`: Harcama kaydı ekleme
- `GET /spending-summary`: Kategori bazlı harcama özeti
- `DELETE /spending-log`: Kategori bazlı harcama silme

### Ödeme İşlemleri
- `GET /unpaid-bills`: Ödenmemiş faturaları listeleme
- `GET /unpaid-cards`: Kredi kartlarını listeleme
- `POST /make-payment`: Ödeme yapma
- `POST /run-daily-checks`: Günlük kontrolleri çalıştırma

### Raporlama İşlemleri
- `POST /generate_report`: Finansal rapor oluşturma

#### Rapor Türleri

1. **Gelir-Gider Dengesi Raporu (report_type: 1)**
   - Aylık bazda bütçe, harcama ve kalan miktar bilgilerini gösterir
   - Fatura ve kredi kartı ödemelerini içerir
   - Her ay için toplam bütçe, toplam harcama ve kalan miktar hesaplanır

2. **Kategori Bazlı Harcama Raporu (report_type: 2)**
   - Harcamaları kategorilere göre yüzde olarak gösterir
   - Her kategori için toplam harcama miktarı ve yüzdesi hesaplanır
   - Toplam bütçe ve toplam harcama bilgilerini içerir

#### Örnek Rapor İsteği

```bash
# Gelir-Gider Dengesi Raporu
curl -X POST http://localhost:5000/generate_report \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "email": "kullanici@example.com",
    "report_type": 1,
    "year": 2024
  }'

# Kategori Bazlı Harcama Raporu
curl -X POST http://localhost:5000/generate_report \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "email": "kullanici@example.com",
    "report_type": 2,
    "year": 2024
  }'
```

#### Örnek Yanıtlar

1. **Gelir-Gider Dengesi Raporu Yanıtı**:
```json
{
  "report_type": "monthly_balance",
  "year": 2024,
  "data": [
    {
      "month": 1,
      "total_budget": 5000.0,
      "total_spending": 2500.0,
      "remaining": 2500.0
    },
    // ... diğer aylar
  ]
}
```

2. **Kategori Bazlı Harcama Raporu Yanıtı**:
```json
{
  "report_type": "category_spending",
  "year": 2024,
  "data": {
    "total_budget": 5000.0,
    "total_spending": 3000.0,
    "categories": {
      "Giyim": {
        "amount": 600.0,
        "percentage": 20.0
      },
      "Yemek": {
        "amount": 1200.0,
        "percentage": 40.0
      },
      // ... diğer kategoriler
    }
  }
}
```

## Örnek API İstekleri

### Kullanıcı Kaydı
```bash
curl -X POST http://localhost:5000/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "kullanici",
    "email": "kullanici@example.com",
    "password": "sifre123"
  }'
```

### Kullanıcı Girişi
```bash
curl -X POST http://localhost:5000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kullanici@example.com",
    "password": "sifre123"
  }'
```

### Bütçe Oluşturma
```bash
curl -X POST http://localhost:5000/budget \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "initial_budget": 5000
  }'
```

### Kredi Kartı Ekleme
```bash
curl -X POST http://localhost:5000/credit-card \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "bank_name": "Garanti",
    "card_limit": 10000,
    "due_date_start": "2024-01-01",
    "due_date_end": "2024-01-31",
    "current_balance": 5000
  }'
```

### Fatura Ekleme
```bash
curl -X POST http://localhost:5000/bill \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "bill_name": "Elektrik Faturası",
    "amount": 250,
    "category": "Faturalar",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "is_paid": false
  }'
```

### Harcama Kaydı Ekleme
```bash
curl -X POST http://localhost:5000/spending-log \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "category": "Yemek",
    "amount": 150
  }'
```

### Harcama Özeti Görüntüleme
```bash
curl -X GET http://localhost:5000/spending-summary \
  -H "X-User-Email: kullanici@example.com"
```

### Harcama Silme
```bash
curl -X DELETE http://localhost:5000/spending-log \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "category": "Yemek"
  }'
```

### Ödenmemiş Faturaları Listeleme
```bash
curl -X GET http://localhost:5000/unpaid-bills \
  -H "X-User-Email: kullanici@example.com"
```

### Kredi Kartlarını Listeleme
```bash
curl -X GET http://localhost:5000/unpaid-cards \
  -H "X-User-Email: kullanici@example.com"
```

### Fatura Ödeme
```bash
curl -X POST http://localhost:5000/make-payment \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "email": "kullanici@example.com",
    "odeme_turu": "bill",
    "isim": "Elektrik",
    "odeme_tutari": 250
  }'
```

### Kredi Kartı Ödeme
```bash
curl -X POST http://localhost:5000/make-payment \
  -H "Content-Type: application/json" \
  -H "X-User-Email: kullanici@example.com" \
  -d '{
    "email": "kullanici@example.com",
    "odeme_turu": "card",
    "isim": "Garanti",
    "odeme_tutari": 1000
  }'
```

### Dinamik Anasayfa Mesajları

`GET /home/messages` endpoint'i, kullanıcının finansal durumuna göre dinamik mesajlar döndürür. Bu mesajlar aşağıdaki durumlara göre oluşturulur:

1. **Bütçe Uyarısı**: Bütçenin %90'ı harcandığında
2. **Eğitim Harcamaları**: Eğitim kategorisindeki harcamalar diğer kategorilerden fazla olduğunda
3. **Harcama Eksikliği**: Ay içinde hiç harcama yapılmadığında
4. **Spor Harcamaları**: Spor kategorisindeki harcamalar bütçenin %30'undan fazla olduğunda

#### Örnek İstek

```bash
curl -X GET http://localhost:5000/home/messages \
  -H "X-User-Email: kullanici@example.com"
```

#### Örnek Yanıtlar

1. **Bütçe Uyarısı**:
```json
{
  "messages": [
    "💸 Kaynaklarınız tükenmek üzere, harcamalarınıza dikkat edin!"
  ]
}
```

2. **Eğitim Harcamaları**:
```json
{
  "messages": [
    "🎓 Bu ay eğitim harcamalarınız diğer kategorilere göre daha yüksek."
  ]
}
```

3. **Harcama Eksikliği**:
```json
{
  "messages": [
    "🔍 Henüz bir harcama girişi yapmadınız. Harcamalarınızı kaydedin."
  ]
}
```

4. **Spor Harcamaları**:
```json
{
  "messages": [
    "🏋️ Bu ay spor harcamalarınız artmış görünüyor."
  ]
}
```

5. **Birden Fazla Mesaj**:
```json
{
  "messages": [
    "💸 Kaynaklarınız tükenmek üzere, harcamalarınıza dikkat edin!",
    "🎓 Bu ay eğitim harcamalarınız diğer kategorilere göre daha yüksek."
  ]
}
```

#### Hata Yanıtları

**Bütçe Bulunamadı**:
```json
{
  "error": "Budget not found"
}
```

## Frontend-Backend Entegrasyonu

### Bütçe Yönetimi

#### Bütçe Genel Bakış Sayfası (BudgetOverview)

1. **Gelir Girişi ve Cüzdan Kartı**
   - Kullanıcı gelir bilgisini girebilir
   - POST `/budget` endpoint'i ile backend'e gönderilir
   - Kullanıcı email bilgisi localStorage'dan alınır
   - Girilen bütçe Cüzdan kartında gösterilir
   - Backend'de `initial_budget` olarak kaydedilir

2. **Kredi Kartı Limit Takibi ve Varlıklar Kartı**
   - Kredi kartı limitleri ve bakiyeleri backend'den alınır
   - GET `/credit-cards` endpoint'i ile veriler çekilir
   - Her kart için kalan limit hesaplanır (`card_limit - current_balance`)
   - Tüm kartların kalan limitleri toplanarak Varlıklar kartında gösterilir

3. **Toplam Kaynaklar**
   - Toplam Kaynaklar = Cüzdan Bütçesi + Tüm Kartların Kalan Limitleri
   - Otomatik olarak hesaplanır ve gösterilir

#### API Endpoints

1. **Bütçe İşlemleri**
   ```http
   POST /budget
   Headers: {
     "X-User-Email": "user@example.com"
   }
   Body: {
     "initial_budget": 3000
   }
   ```

2. **Kredi Kartı İşlemleri**
   ```http
   GET /credit-cards
   Headers: {
     "X-User-Email": "user@example.com"
   }
   ```

#### Frontend Özellikleri

1. **Veri Yönetimi**
   - Axios ile API çağrıları
   - Otomatik veri yenileme
   - Hata ve başarı mesajları
   - Yükleme durumu gösterimi

2. **Kullanıcı Arayüzü**
   - Responsive tasarım
   - Gerçek zamanlı veri güncelleme
   - Sayısal formatlama (TL)
   - Kullanıcı dostu hata mesajları

3. **Güvenlik**
   - Kullanıcı email bilgisi localStorage'dan alınır
   - API isteklerinde email header'ı kullanılır
   - Input validasyonu (sadece sayısal değer)

#### Backend Gereksinimleri

1. **Veritabanı Alanları**
   - `initial_budget`: Kullanıcının toplam bütçesi
   - `card_limit`: Kredi kartı limiti
   - `current_balance`: Kredi kartı mevcut bakiyesi

2. **API Yanıtları**
   - Başarılı işlemlerde uygun mesaj
   - Hata durumlarında açıklayıcı mesaj
   - HTTP durum kodları

## Notlar
- Tüm API isteklerinde `X-User-Email` header'ı kullanıcı kimliğini belirtmek için kullanılır
- Şifreler veritabanında bcrypt ile hashlenerek saklanır
- Tüm tarihler ISO 8601 formatında gönderilmelidir (YYYY-MM-DD)
- Para birimleri TL cinsinden ve ondalık sayı olarak gönderilmelidir
- E-posta bildirimleri için Gmail SMTP sunucusu kullanılmaktadır
- Gmail hesabınızda 2 Adımlı Doğrulama ve Uygulama Şifresi gereklidir

## Frontend (React) Kullanımı ve Özellikler

### Kullanılan Teknolojiler
- **React**: Modern, component tabanlı frontend kütüphanesi
- **React Router**: Sayfa yönlendirme ve SPA deneyimi
- **Tailwind CSS**: Hızlı ve esnek stil oluşturma
- **Axios**: API istekleri için HTTP istemcisi

### Sayfa Yapısı
- **Giriş (Login):** Kullanıcı girişi
- **Kayıt (Register):** Yeni kullanıcı kaydı
- **Ana Sayfa (Home):** 
  - Sol üstte logo
  - Yatay navigasyon menüsü (Bütçe, Kredi Kartları, Faturalar, Ödemeler, Harcama Günlüğü, Raporlar)
  - Yeşil tonlarında ferah ve sade tasarım
  - Responsive yapı

### Login ve Register İşleyişi
- **Kayıt Ol (Register):**
  - Kullanıcıdan e-posta, şifre ve şifre tekrar alınır.
  - Şifreler eşleşmiyorsa frontend'de uyarı verilir, istek gönderilmez.
  - Eşleşiyorsa `/register` endpointine POST isteği gönderilir (`email`, `password` JSON olarak).
  - Kayıt başarılıysa kullanıcı login sayfasına yönlendirilir. Hata varsa ekranda gösterilir.

- **Giriş Yap (Login):**
  - Kullanıcıdan e-posta ve şifre alınır.
  - `/login` endpointine POST isteği gönderilir.
  - Giriş başarılıysa kullanıcı bilgileri localStorage'a kaydedilir ve anasayfaya yönlendirilir.
  - Hatalı girişte kalan giriş hakkı ekranda gösterilir. 3 hatadan sonra buton devre dışı kalır.
  - Backend tarafında da giriş hakkı (login_attempts) kontrolü yapılır ve ilgili hata mesajı gösterilir.

### API Entegrasyonu
- **Axios** ile istekler yapılır.
- Backend adresi: `http://localhost:5000`
- Tüm istekler JSON formatında yapılır.
- Hata ve başarı mesajları kullanıcıya anlık olarak gösterilir.

### 3 Giriş Hakkı Sistemi
- Kullanıcı login ekranında 3 kez yanlış giriş yapabilir.
- Her hatada kalan hak ekranda gösterilir.
- 3 hatadan sonra giriş butonu devre dışı kalır.
- Backend tarafında da MongoDB'de `login_attempts` alanı ile güvenlik sağlanır.

### UI Tasarım Detayları
- Tüm sayfalarda üstte küçük logo ve arka planda flu, büyük logo bulunur.
- Responsive (mobil uyumlu) ve sade bir arayüz sunulur.
- Tüm metinler ve hata mesajları Türkçedir.
- Tailwind CSS ile modern ve okunabilir bir tasarım uygulanmıştır.

### Örnek Kullanım
- Kayıt ol: E-posta ve şifre girin, şifreler eşleşiyorsa kayıt başarılı olur.
- Giriş yap: E-posta ve şifre girin, 3 kez yanlış girerseniz giriş hakkınız biter.
- Başarılı girişte kullanıcı bilgileri localStorage'a kaydedilir. 