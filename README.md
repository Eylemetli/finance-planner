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

## Kurulum Adımları

1. Gerekli paketleri yükleyin:
```bash
pip install flask flask-cors pymongo bcrypt python-dotenv
```

2. MongoDB'yi başlatın:
```bash
mongod
```

3. `.env` dosyasını oluşturun:
```env
MONGODB_URI=mongodb://localhost:27017/
```

4. Uygulamayı başlatın:
```bash
python app.py
```

## API Endpoints

### Kullanıcı İşlemleri
- `POST /register`: Yeni kullanıcı kaydı
- `POST /login`: Kullanıcı girişi

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

## Notlar
- Tüm API isteklerinde `X-User-Email` header'ı kullanıcı kimliğini belirtmek için kullanılır
- Şifreler veritabanında bcrypt ile hashlenerek saklanır
- Tüm tarihler ISO 8601 formatında gönderilmelidir (YYYY-MM-DD)
- Para birimleri TL cinsinden ve ondalık sayı olarak gönderilmelidir 