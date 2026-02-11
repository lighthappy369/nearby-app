# empati

AI destekli anonim eşleşme ve sohbet uygulaması için MVP API.

## Ne geliştirildi?

Bu sürümde, talebinize uygun şekilde uygulama **AI destekli** olacak şekilde teknik bir temel oluşturuldu:

- Anonim kullanıcı oluşturma (`15+` yaş kontrolü)
- İlgi alanı + değerler + yaşam tarzı + konum odaklı uyumluluk skoru
- AI açıklaması (neden bu eşleşme önerildi)
- AI sohbet açılış cümleleri (ice-breaker önerileri)
- Eşleşme oluşturma ve kullanıcı eşleşmelerini listeleme

> Not: Bu MVP sürümü in-memory veri deposu kullanır. Sonraki adımda PostgreSQL/MongoDB + gerçek auth + ödeme altyapısına geçilir.

## Teknoloji

- Node.js
- Node.js HTTP server (dependency-free)
- Native test runner (`node --test`)

## Kurulum

```bash
npm install
npm start
```

API varsayılan olarak `http://localhost:3000` üzerinde çalışır.

## Test

```bash
npm test
```



## Web Arayüzlü Demo

API ile birlikte çalışan basit bir demo ekranı eklendi. Çalıştırdıktan sonra tarayıcıdan açın:

- `http://localhost:3000/`

Bu ekranda:
- health kontrolü
- 2 demo kullanıcı üretimi
- öneri çekme
- eşleşme oluşturma

adımlarını butonlarla test edebilirsiniz.

## API Uç Noktaları

### 1) Sağlık kontrolü
`GET /health`

### 2) Kullanıcı oluştur
`POST /users`

Örnek gövde:

```json
{
  "age": 24,
  "language": "tr",
  "interests": ["music", "travel", "fitness"],
  "values": ["honesty", "family"],
  "lifestyle": ["early-riser"],
  "location": { "lat": 52.52, "lon": 13.40 }
}
```

### 3) Önerilen eşleşmeleri getir
`GET /users/:id/recommendations`

Döndürülen her aday için:
- `score` (0-100)
- `breakdown` (interest/values/lifestyle/location)
- `aiReason`
- `iceBreakers`

### 4) Eşleşme oluştur
`POST /matches`

```json
{
  "userA": "uuid-a",
  "userB": "uuid-b"
}
```

### 5) Kullanıcının eşleşmelerini getir
`GET /users/:id/matches`

### 6) Jung soruları
`GET /jung/questions`

### 7) Jung skorla
`POST /jung/score`

Örnek gövde:

```json
{
  "answers": [
    { "id": "q1", "value": 5 },
    { "id": "q2", "value": 3 }
  ]
}
```

### 8) Auth register
`POST /auth/register`

### 9) Auth login
`POST /auth/login`

### 10) Me (token gerekli)
`GET /me`

### 11) Stripe webhook
`POST /stripe/webhook`

### 12) Event tracking
`POST /events`, `GET /events`

## Monetizasyon için bir sonraki teknik adımlar

1. Stripe/RevenueCat ile abonelik katmanı
2. Paywall kural motoru (free limit + premium unlock)
3. Event tracking (activation, D1/D7, ARPU, churn)
4. Moderasyon & trust-safety pipeline
5. Veritabanı + cache + kuyruk altyapısı

## Kod dışa aktarma

```bash
git archive --format=zip --output empati.zip HEAD
```


## Para Odaklı İletişim Metinleri

Yatırımcı sunumu, landing page ve abonelik açıklaması için hazır TR metin seti eklendi:

- `docs/monetization-copy-tr.md`

Bu dosyada 3 farklı ton (profesyonel, kısa pazarlama, pitch deck) ve doğrudan kullanılabilir şablonlar bulunur.


## Day 1 Launch Paket

Hızlı gelir doğrulaması için landing sayfası eklendi:

- `http://localhost:3000/launch`
- Stripe ödeme linki için env: `STRIPE_PAYMENT_LINK`

Ayrıca Jung tabanlı test MVP endpointleri eklendi:

- `GET /jung/questions`
- `POST /jung/score`


## Production Skeleton (DB + Auth + Stripe Webhook)

Bu sürümde production'a geçiş için temel iskelet endpointleri eklendi:

- `POST /auth/register`
- `POST /auth/login`
- `GET /me` (Bearer token)
- `POST /stripe/webhook`
- `POST /events`
- `GET /events`
- `POST /moderation/report`

Stripe webhook güvenliği için opsiyonel env:

- `STRIPE_WEBHOOK_SECRET` (header: `x-stripe-signature`)

Not: Bu hâlâ in-memory iskelettir; sonraki adım PostgreSQL + migration katmanıdır.


## Web Arayüz Akışı

- `GET /` : Empati Berlin ana giriş ekranı (döngü haritası/orbit görseli + kayıt CTA).
- `GET /personality-test` : Jung tabanlı kişilik testi ekranı (ilk 10 soruyu UI üzerinden puanlayıp `/jung/score` çağırır).
- `GET /launch` : Stripe odaklı launch landing sayfası.
