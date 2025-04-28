# Flask Authentication Backend

Bu proje, Flask kullanılarak oluşturulmuş basit bir kimlik doğrulama backend'idir. MongoDB veritabanı kullanılarak kullanıcı bilgileri saklanır ve bcrypt ile şifreler güvenli bir şekilde hash'lenir.

## Kurulum

1. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

2. MongoDB'yi başlatın ve çalıştığınızdan emin olun.

3. `.env` dosyasını oluşturun ve MongoDB bağlantı bilgilerinizi ekleyin:
```
MONGODB_URI=mongodb://localhost:27017/
FLASK_APP=app.py
FLASK_ENV=development
```

4. Uygulamayı başlatın:
```bash
python app.py
```

## API Endpoints

### Register
- **URL**: `/register`
- **Method**: `POST`
- **Body**:
```json
{
    "username": "kullanici_adi",
    "email": "email@example.com",
    "password": "sifre123"
}
```

### Login
- **URL**: `/login`
- **Method**: `POST`
- **Body**:
```json
{
    "email": "email@example.com",
    "password": "sifre123"
}
``` 