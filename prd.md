# V1 PRD — Butik Ahşap Mobilya E-Ticaret Sitesi

## 1. Proje Özeti

Bu proje, butik ve özel üretim ahşap mobilya satışı yapan bir firma için geliştirilecek sade, hızlı ve yönetilebilir bir e-ticaret/katalog platformudur.

Sistem klasik e-ticaret altyapılarından farklı olarak online kredi kartı ile ödeme almayacaktır.

Müşteri:

* ürünleri inceleyebilecek,
* kategori ve koleksiyonları görüntüleyebilecek,
* ürünleri sepete ekleyebilecek,
* iletişim ve teslimat bilgilerini girerek sipariş talebi oluşturabilecek,
* sipariş sonrasında IBAN bilgilerini görebilecek,
* WhatsApp üzerinden firma ile iletişime geçebilecektir.

Sipariş oluşturulduğunda doğrudan tamamlanmış satış olarak kabul edilmeyecek, admin paneline **onay bekleyen sipariş** olarak düşecektir.

Firma siparişi admin panelinden inceleyip durumunu yönetebilecektir.

---

# 2. V1 Hedefi

V1'in amacı kapsamlı bir e-commerce sistemi oluşturmak değildir.

Amaç:

> Firmanın ürünlerini profesyonel biçimde sergileyebildiği, müşterinin hızlı biçimde sipariş talebi oluşturabildiği ve firmanın tüm temel içerikleri ile siparişleri tek bir admin panelinden yönetebildiği sade bir satış platformu oluşturmaktır.

Sistem özellikle:

* hızlı,
* mobil uyumlu,
* sade,
* kolay yönetilebilir,
* görsel ağırlıklı,
* premium mobilya markasına uygun

olmalıdır.

---

# 3. Teknoloji Stack

## 3.1 Frontend

* Next.js
* TypeScript
* React
* Tailwind CSS

UI component altyapısında gerektiğinde:

* shadcn/ui

kullanılabilir.

Ancak hazır component görünümü olduğu gibi kullanılmamalıdır.

Komponentler markanın tasarım diline göre özelleştirilmelidir.

---

## 3.2 Backend

Next.js full-stack mimarisi kullanılacaktır.

Backend işlemleri:

* Next.js Route Handlers
* Server Actions

üzerinden gerçekleştirilebilir.

Ayrı Express, NestJS veya başka backend projesi oluşturulmayacaktır.

---

## 3.3 Database

PostgreSQL kullanılacaktır.

---

## 3.4 ORM

Prisma ORM kullanılacaktır.

---

## 3.5 Validation

Zod kullanılacaktır.

Hem client hem server tarafındaki kritik veriler doğrulanmalıdır.

---

## 3.6 Form Yönetimi

Gerekli yerlerde:

* React Hook Form
* Zod

kombinasyonu kullanılabilir.

---

# 4. Mimari Yaklaşım

Sistem monolitik Next.js uygulaması olacaktır.

```text
Client
   │
   ▼
Next.js
   │
   ├── Storefront
   ├── Admin CMS
   ├── API / Server Actions
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

V1 içerisinde mikroservis mimarisi kullanılmayacaktır.

Aşağıdaki teknolojiler V1 için gereksiz kabul edilmektedir:

* Kafka
* RabbitMQ
* Elasticsearch
* Redis
* ayrı backend servisi
* GraphQL
* event-driven architecture

---

# 5. Kullanıcı Rolleri

V1 içerisinde iki temel aktör bulunacaktır.

## 5.1 Customer

Üye olmak zorunda değildir.

Customer:

* ürünleri görüntüler,
* kategorileri görüntüler,
* ürün detaylarına girer,
* sepete ürün ekler,
* sepeti düzenler,
* sipariş oluşturur,
* IBAN bilgilerini görüntüler,
* WhatsApp üzerinden iletişim kurar.

---

## 5.2 Admin

Admin giriş yapmak zorundadır.

Admin:

* dashboard görüntüler,
* siparişleri yönetir,
* ürünleri yönetir,
* kategorileri yönetir,
* katalog içeriğini yönetir,
* ana sayfa içeriklerini yönetir,
* footer içeriğini yönetir,
* firma bilgilerini yönetir,
* logo yönetir,
* IBAN bilgilerini yönetir,
* WhatsApp ve iletişim bilgilerini yönetir,
* KVKK ve sözleşme metinlerini yönetir,
* gizlilik ve yasal sayfaları yönetir.

---

# 6. Storefront Sayfaları

V1 içerisinde aşağıdaki public sayfalar bulunmalıdır.

```text
/
 /urunler
 /urun/[slug]
 /kategori/[slug]
 /sepet
 /siparis
 /siparis/basarili
 /hakkimizda
 /iletisim
 /kvkk
 /gizlilik-politikasi
 /mesafeli-satis-sozlesmesi
 /teslimat-ve-iade
```

Admin tarafından oluşturulabilen ek yasal/statik sayfalara ihtiyaç duyulursa dinamik CMS Page sistemi kullanılabilir.

---

# 7. Ana Sayfa

Ana sayfa ürün ve marka odaklı olacaktır.

## V1 Ana Sayfa Blokları

Minimum:

1. Header
2. Hero Section
3. Kategoriler
4. Öne Çıkan Ürünler
5. Marka / üretim hikâyesi
6. Özel üretim CTA
7. WhatsApp CTA
8. Footer

---

# 8. Hero Section

Hero alanı tamamen CMS üzerinden yönetilebilmelidir.

Admin aşağıdaki alanları değiştirebilmelidir:

* başlık
* alt başlık
* açıklama
* desktop görsel
* mobil görsel
* CTA yazısı
* CTA hedefi
* ikinci CTA
* içerik hizalama
* aktif/pasif durumu

Örnek:

```text
Başlık:
Doğal Ahşabın Zamansız Formu

Açıklama:
El işçiliği, doğal malzemeler ve zamansız tasarımlar.

CTA:
Koleksiyonu Keşfet
```

Hero metinleri kod içerisinde hard-code edilmemelidir.

---

# 9. Header

Header aşağıdaki alanları içerebilir:

* logo
* ürünler
* kategoriler
* hakkımızda
* iletişim
* WhatsApp
* sepet

Mobilde responsive navigation kullanılmalıdır.

---

# 10. Logo ve Firma Kimliği Yönetimi

Admin panelinden aşağıdakiler değiştirilebilmelidir:

```text
Firma adı
Kısa firma adı
Logo
Mobil logo
Favicon
Footer logo
```

Kod içerisinde firma adı veya logo sabit olmamalıdır.

---

# 11. Ürün Yönetimi

Admin ürün ekleyebilmeli, düzenleyebilmeli ve pasife alabilmelidir.

## Product

Alanlar:

```text
id
name
slug
productCode

shortDescription
description

price
discountPrice

categoryId

material
dimensions
productionTime
deliveryInformation

featured
active

createdAt
updatedAt
```

---

# 12. Ürün Durumları

Ürün:

```text
DRAFT
ACTIVE
INACTIVE
```

mantığında yönetilebilir.

Public tarafta yalnızca aktif ürünler gösterilmelidir.

---

# 13. Ürün Görselleri

Bir üründe birden fazla görsel bulunabilmelidir.

## ProductImage

```text
id
productId
url
altText
sortOrder
isCover
```

Admin:

* görsel yükleyebilmeli,
* silebilmeli,
* sıralamasını değiştirebilmeli,
* kapak görselini seçebilmelidir.

---

# 14. Ürün Detay Sayfası

Ürün detay sayfasında minimum:

* ürün adı
* ürün kodu
* galeri
* fiyat
* varsa indirimli fiyat
* açıklama
* malzeme
* ölçüler
* üretim süresi
* teslimat bilgisi
* sepete ekle
* WhatsApp ile bilgi al

bulunmalıdır.

---

# 15. WhatsApp Ürün İletişimi

Her ürün sayfasında:

```text
WhatsApp'tan Bilgi Al
```

butonu bulunmalıdır.

Otomatik mesaj:

```text
Merhaba,

[ÜRÜN ADI]
Ürün Kodu: [ÜRÜN KODU]

ürünü hakkında bilgi almak istiyorum.
```

şeklinde oluşturulmalıdır.

WhatsApp API entegrasyonu gerekmemektedir.

Standart WhatsApp URL yapısı kullanılacaktır.

---

# 16. Kategori Yönetimi

Admin kategori oluşturabilmelidir.

## Category

```text
id
name
slug
description
image
active
sortOrder
createdAt
updatedAt
```

Admin:

* kategori ekleyebilir,
* kategori düzenleyebilir,
* sıralayabilir,
* aktif/pasif yapabilir.

---

# 17. Sepet

V1'de müşterinin hesap oluşturması gerekmeyecektir.

Sepet client-side tutulabilir.

Tercih:

```text
localStorage
```

Sepet şu bilgileri içermelidir:

```text
productId
quantity
```

Kullanıcı:

* ürün ekleyebilir,
* ürün kaldırabilir,
* miktar artırabilir,
* miktar azaltabilir,
* sepet toplamını görebilir.

---

# 18. Sepet Kuralları

### CART-001

Aktif ürün sepete eklenebilmelidir.

### CART-002

Aynı ürün yeniden eklenirse yeni satır oluşturmak yerine quantity artırılmalıdır.

### CART-003

Sayfa yenilendiğinde sepet kaybolmamalıdır.

### CART-004

Sepette pasif hale gelmiş ürün varsa checkout sırasında server doğrulaması yapılmalıdır.

### CART-005

Sepette görünen fiyat hiçbir zaman doğrudan client tarafından sipariş fiyatı olarak kabul edilmemelidir.

Checkout sırasında ürün fiyatları database üzerinden tekrar alınmalıdır.

---

# 19. Checkout / Sipariş Formu

Checkout sayfasında müşteri minimum aşağıdaki bilgileri girmelidir.

## Müşteri

```text
Ad
Soyad
Telefon
E-posta — opsiyonel
```

## Adres

```text
İl
İlçe
Adres
```

## Sipariş

```text
Sipariş notu — opsiyonel
```

---

# 20. Checkout Yasal Onayları

Sipariş oluşturulmadan önce müşteri minimum:

* KVKK metni
* Gizlilik Politikası
* Mesafeli Satış Sözleşmesi

bağlantılarını görebilmelidir.

Gerekli onay checkbox'ları uygulanmalıdır.

Örneğin:

```text
[ ] Mesafeli satış sözleşmesini okudum ve kabul ediyorum.
```

Admin bu metinleri CMS üzerinden değiştirebilmelidir.

---

# 21. Sipariş Oluşturma

Checkout tamamlandığında Order oluşturulacaktır.

Sipariş ilk durum:

```text
PENDING
```

olmalıdır.

Bu durum müşterinin sipariş talebinin firma tarafından henüz onaylanmadığını ifade eder.

---

# 22. Order Model

```text
Order

id
orderNumber

customerFirstName
customerLastName
phone
email

city
district
address

subtotal
total

status

customerNote
adminNote

createdAt
updatedAt
```

---

# 23. OrderItem

```text
OrderItem

id
orderId
productId

productName
productCode

quantity
unitPrice
totalPrice

createdAt
```

Sipariş sırasında ürünün:

* adı
* kodu
* birim fiyatı

OrderItem içerisine snapshot olarak kaydedilmelidir.

Ürünün ileride fiyatı değiştiğinde geçmiş sipariş etkilenmemelidir.

---

# 24. Sipariş Numarası

Müşteriye database ID veya UUID gösterilmemelidir.

İnsan tarafından okunabilir sipariş numarası kullanılmalıdır.

Örnek:

```text
PH-2026-000001
PH-2026-000002
```

Prefix admin ayarlarından değiştirilebilir olması tercih edilir.

---

# 25. Sipariş Durumları

V1:

```text
PENDING
APPROVED
PAYMENT_PENDING
PAID
IN_PRODUCTION
READY
SHIPPED
COMPLETED
CANCELLED
```

UI karşılıkları:

```text
Bekliyor
Onaylandı
Ödeme Bekleniyor
Ödeme Alındı
Üretimde
Hazır
Gönderildi
Tamamlandı
İptal Edildi
```

---

# 26. Sipariş Başarı Ekranı

Sipariş oluşturulduktan sonra kullanıcı:

```text
/siparis/basarili
```

sayfasına yönlendirilmelidir.

Sayfa:

* teşekkür mesajı,
* sipariş numarası,
* sipariş toplamı,
* siparişin henüz onay beklediği bilgisi,
* IBAN,
* banka adı,
* hesap sahibi,
* IBAN kopyala,
* WhatsApp butonu,
* telefon butonu

içermelidir.

---

# 27. Sipariş Sonrası Mesaj

Örnek UI metni:

```text
Sipariş talebiniz alınmıştır.

Siparişiniz firmamız tarafından kontrol edildikten sonra sizinle iletişime geçilecektir.

Ödeme yapmak isterseniz aşağıdaki banka bilgilerini kullanabilirsiniz.
```

V1 sisteminde online ödeme bulunmadığı açıkça belirtilmelidir.

---

# 28. WhatsApp Sipariş Mesajı

Sipariş sonrası WhatsApp butonu aşağıdaki formata yakın bir mesaj oluşturmalıdır:

```text
Merhaba,

PH-2026-000231 numaralı siparişim hakkında iletişime geçmek istiyorum.

Sipariş toplamı: 48.900 TL
```

---

# 29. IBAN Yönetimi

IBAN kod içerisine hard-code edilmemelidir.

Admin panelinden yönetilmelidir.

## BankAccount

```text
id
bankName
accountHolder
iban
description
active
sortOrder
createdAt
updatedAt
```

Birden fazla hesap desteklenebilir.

---

# 30. Admin Panel

Admin:

```text
/admin
```

altında çalışacaktır.

Önerilen route yapısı:

```text
/admin
/admin/orders
/admin/orders/[id]

/admin/products
/admin/products/new
/admin/products/[id]

/admin/categories

/admin/content
/admin/content/home
/admin/content/footer
/admin/content/pages

/admin/settings
/admin/settings/company
/admin/settings/contact
/admin/settings/bank

/admin/users
```

---

# 31. Admin Dashboard

Dashboard sade olmalıdır.

Minimum kartlar:

```text
Bekleyen Sipariş
Onaylanan Sipariş
Üretimde
Tamamlanan
```

Ayrıca:

```text
Son Siparişler
```

tablosu bulunmalıdır.

İlk V1 için ağır analytics dashboard yapılmamalıdır.

---

# 32. Sipariş Yönetimi

Sipariş listesi aşağıdaki bilgileri göstermelidir:

```text
Sipariş No
Müşteri
Telefon
Toplam
Durum
Tarih
```

Filtre:

```text
Durum
```

minimum gereksinimdir.

Arama:

```text
Sipariş No
Müşteri adı
Telefon
```

üzerinden yapılabilmelidir.

---

# 33. Sipariş Detay Ekranı

Admin:

* müşteri bilgilerini,
* telefon numarasını,
* adresi,
* sipariş ürünlerini,
* toplam tutarı,
* müşteri notunu,
* sipariş durumunu,
* admin notunu

görebilmelidir.

Admin:

```text
WhatsApp'tan Ara
```

veya:

```text
WhatsApp
```

butonuna basarak müşteriyle iletişim kurabilmelidir.

---

# 34. Admin CMS

Admin paneli sadece ürün ve sipariş sistemi olmamalıdır.

Firma günlük içerik değişikliklerini geliştiriciye ihtiyaç duymadan yapabilmelidir.

CMS kapsamında V1 minimum aşağıdaki alanları içermelidir.

---

# 35. Firma Bilgileri CMS

Admin aşağıdaki alanları düzenleyebilmelidir:

```text
Firma adı
Kısa firma adı
Firma açıklaması
Logo
Mobil logo
Favicon
Adres
Telefon
WhatsApp numarası
E-posta
Instagram
Facebook
YouTube
Çalışma saatleri
```

Gerekli olmayan sosyal medya alanları boş bırakılabilir.

---

# 36. Ana Sayfa CMS

Admin:

### Hero

* başlık
* açıklama
* görsel
* mobil görsel
* CTA
* CTA URL

düzenleyebilmelidir.

### Marka Hikâyesi

```text
Başlık
Açıklama
Görsel
```

### Özel Üretim CTA

```text
Başlık
Açıklama
Buton
WhatsApp veya URL
```

Alanları yönetilebilir olmalıdır.

---

# 37. Footer CMS

Footer tamamen yönetilebilir olmalıdır.

Admin aşağıdaki alanları değiştirebilmelidir:

```text
Footer logo
Firma kısa açıklaması

Adres
Telefon
WhatsApp
E-posta

Instagram
Facebook
YouTube

Copyright metni
```

Footer link grupları da mümkün olduğunca CMS üzerinden yönetilmelidir.

Örneğin:

```text
Kurumsal

Hakkımızda
İletişim
```

ve:

```text
Yasal

KVKK
Gizlilik Politikası
Mesafeli Satış Sözleşmesi
Teslimat ve İade
```

---

# 38. CMS Sayfa Sistemi

Statik içerikler için basit Page modeli oluşturulmalıdır.

## CmsPage

```text
id
title
slug
content
type
active
createdAt
updatedAt
```

Örneğin:

```text
/about
/privacy
/kvkk
/distance-sales
/delivery-return
```

---

# 39. Yasal Sayfalar

Admin minimum aşağıdaki içerikleri düzenleyebilmelidir:

* KVKK Aydınlatma Metni
* Gizlilik Politikası
* Mesafeli Satış Sözleşmesi
* Teslimat Politikası
* İade / Değişim Politikası
* Çerez Politikası — ihtiyaç halinde
* Kullanım Koşulları — ihtiyaç halinde

Bu içerikler source code içerisinde tutulmamalıdır.

---

# 40. CMS Editor

İçerik düzenleme alanlarında rich text editor kullanılabilir.

Ancak editor çıktısı güvenli biçimde render edilmelidir.

Admin:

* başlık,
* paragraf,
* liste,
* bold,
* link

gibi temel içerik formatlarını kullanabilmelidir.

WordPress seviyesinde karmaşık page builder yapılmamalıdır.

---

# 41. Site Settings

Genel sistem ayarları için:

## SiteSetting

veya mantıksal settings tabloları kullanılabilir.

Örnek alanlar:

```text
siteName
siteDescription

logoUrl
mobileLogoUrl
faviconUrl

phone
whatsapp
email

address

instagram
facebook
youtube

orderPrefix

currency

footerCopyright
```

Gerektiğinde JSON kullanımı mümkündür ancak kritik business entity'leri tek büyük JSON içerisinde saklamaktan kaçınılmalıdır.

---

# 42. Authentication

V1'de yalnızca admin authentication gereklidir.

Admin:

```text
email
password
```

ile giriş yapabilir.

Password plaintext saklanmayacaktır.

Password güvenli hash algoritması ile saklanmalıdır.

---

# 43. AdminUser

```text
id
name
email
passwordHash
role
active
createdAt
updatedAt
```

V1 role:

```text
ADMIN
```

yeterlidir.

Ancak schema ileride:

```text
ADMIN
EDITOR
```

gibi roller eklenebilecek şekilde tasarlanabilir.

---

# 44. Admin Security

Minimum:

* secure password hashing
* HTTP-only cookie
* secure session management
* CSRF risklerinin değerlendirilmesi
* server-side authorization
* input validation
* rate limiting login endpoint
* production'da HTTPS

uygulanmalıdır.

Admin route koruması sadece frontend redirect ile yapılmamalıdır.

Server-side kontrol bulunmalıdır.

---

# 45. Görsel Upload Sistemi

Ürün ve CMS görselleri database içinde binary olarak tutulmamalıdır.

Database URL saklamalıdır.

Storage çözümü adapter mantığıyla uygulanmalıdır.

Önerilen production çözümü:

```text
Cloudflare R2
```

Alternatif:

```text
S3 compatible object storage
```

---

# 46. SEO

V1'de ileri düzey SEO paneli gerekmemektedir.

Ancak temel teknik SEO uygulanmalıdır.

Minimum:

* semantic HTML
* metadata
* title
* description
* clean slug
* canonical
* sitemap
* robots.txt
* OpenGraph metadata
* responsive design
* image alt text
* Product structured data uygulanabiliyorsa kullanılmalıdır.

---

# 47. Product SEO

Ürün route'u:

```text
/urun/lina-thermowood-bahce-takimi
```

gibi temiz slug kullanmalıdır.

Şu yapı kullanılmamalıdır:

```text
/product?id=83921
```

---

# 48. UI / UX Tasarım İlkeleri

Projenin en önemli gereksinimlerinden biri generic AI-generated UI görünümünden uzak durmasıdır.

## Kesinlikle kaçınılacak tasarım dili

Aşağıdaki “AI slop” kalıpları mümkün olduğunca kullanılmamalıdır:

* her bölümde devasa rounded card
* aşırı `rounded-3xl`
* gereksiz gradient arka planlar
* mor/mavi SaaS gradientleri
* glow efektleri
* glassmorphism
* gereksiz floating cards
* her alanda badge kullanımı
* yapay dashboard kart kalabalığı
* aşırı gölgeler
* rastgele icon kullanımı
* her elementin container içine alınması
* hero bölümünde anlamsız abstract şekiller
* template gibi görünen landing page
* aşırı animasyon

---

# 49. Storefront Tasarım Dili

Storefront bir SaaS sitesi gibi görünmemelidir.

Hedef:

> Premium mobilya katalog / editorial design.

Tasarım:

* ürün fotoğrafı odaklı,
* geniş whitespace,
* doğal ve sakin,
* sofistike,
* okunabilir,
* büyük editorial typography,
* mobilya markası hissi veren,
* ürünün önüne geçmeyen

olmalıdır.

---

# 50. Renk Kullanımı

Renkler markaya göre belirlenecektir.

Ancak genel yaklaşım:

```text
Kırık beyaz
Krem
Sıcak gri
Doğal ahşap tonları
Koyu kahve / koyu gri
```

gibi doğal paletlere uygun olabilir.

Bu renkler hard requirement değildir.

Marka renkleri CMS değil design-system seviyesinde yönetilebilir.

---

# 51. Typography

Font hiyerarşisi net olmalıdır.

Önerilen yaklaşım:

```text
Display / Serif
+
Clean Sans Serif
```

kombinasyonu düşünülebilir.

Ancak aşırı “lüks marka” klişesine kaçılmamalıdır.

---

# 52. Border Radius

Border radius kontrollü kullanılmalıdır.

Örneğin:

```text
4px
8px
12px
```

gibi ölçüler tercih edilebilir.

Her şey:

```text
24px
32px
```

radius ile tasarlanmamalıdır.

---

# 53. Cards

Card yalnızca gerçekten gerekli olduğunda kullanılmalıdır.

Ürün listelemesinde:

* büyük ürün fotoğrafı,
* ürün adı,
* fiyat

çoğu zaman yeterlidir.

Gereksiz kart border'ı ve shadow kullanılmamalıdır.

---

# 54. Animasyon

Animasyonlar:

* kısa,
* subtle,
* işlevsel

olmalıdır.

Örnek:

* görsel hover
* menu transition
* cart drawer
* küçük opacity transition

kabul edilebilir.

Heavy scroll animation kullanılmamalıdır.

---

# 55. Admin UI Tasarım Dili

Admin panelinin amacı estetik gösteriş değil kullanılabilirliktir.

Admin panel:

* dense fakat temiz,
* tablo odaklı,
* hızlı,
* kolay okunabilir

olmalıdır.

AI SaaS dashboard görünümünden uzak durmalıdır.

---

# 56. Admin Dashboard Tasarım Kuralları

Admin ekranında:

* gereksiz grafikler,
* gradient kartlar,
* anlamsız yüzde göstergeleri,
* random KPI'lar

bulunmamalıdır.

Örneğin dört basit metric yeterlidir:

```text
Bekleyen
Onaylanan
Üretimde
Tamamlanan
```

---

# 57. Responsive Design

Storefront tamamen responsive olacaktır.

Öncelikli cihaz:

```text
mobile
```

olmalıdır.

Çünkü WhatsApp üzerinden satış yapan işletmelerde trafiğin önemli bölümünün mobil olması beklenmektedir.

---

# 58. Mobile UX

Mobilde:

* ürün fotoğrafı büyük,
* CTA görünür,
* sepete ekle kolay,
* WhatsApp erişilebilir,
* checkout formu basit

olmalıdır.

Sticky CTA kullanılabilir:

```text
Sepete Ekle
```

veya:

```text
WhatsApp
```

ancak ekranı agresif şekilde kaplamamalıdır.

---

# 59. Error Handling

Kullanıcıya raw backend error gösterilmemelidir.

Örneğin:

```text
Sipariş oluşturulamadı.
Lütfen tekrar deneyin.
```

gibi kullanıcı dostu mesajlar kullanılmalıdır.

Server error detayları loglanmalıdır.

---

# 60. Sipariş Güvenliği

Sipariş oluşturulurken:

* productId server'da doğrulanmalı,
* ürün aktif mi kontrol edilmeli,
* fiyat database'den okunmalı,
* total backend tarafından hesaplanmalıdır.

Client tarafından gönderilen:

```text
price
total
```

değerlerine güvenilmemelidir.

---

# 61. Telefon Validasyonu

Telefon numarası server-side doğrulanmalıdır.

Türkiye odaklı ilk sürümde:

```text
+90
05xx
```

formatları normalize edilebilir.

Database içerisinde mümkünse normalize edilmiş format saklanmalıdır.

---

# 62. Para Alanları

Para işlemlerinde JavaScript floating-point değerlerine güvenilmemelidir.

Database tarafında:

```text
Decimal
```

kullanılmalıdır.

Prisma'da uygun Decimal type tercih edilmelidir.

---

# 63. Prisma Ana Entity'leri

V1 minimum:

```text
AdminUser

Category

Product
ProductImage

Order
OrderItem

BankAccount

CmsPage

SiteSetting
```

İhtiyaç halinde:

```text
HomepageSection
```

gibi ek içerik entity'leri oluşturulabilir.

---

# 64. Önerilen Prisma İlişkileri

```text
Category
   1
   │
   │
   N
Product

Product
   1
   │
   │
   N
ProductImage


Order
   1
   │
   │
   N
OrderItem
```

---

# 65. Önerilen Proje Yapısı

```text
src/
│
├── app/
│   │
│   ├── (store)/
│   │   ├── page.tsx
│   │   ├── urunler/
│   │   ├── urun/[slug]/
│   │   ├── kategori/[slug]/
│   │   ├── sepet/
│   │   ├── siparis/
│   │   └── iletisim/
│   │
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── content/
│   │   └── settings/
│   │
│   └── api/
│
├── components/
│   ├── storefront/
│   ├── admin/
│   └── ui/
│
├── lib/
│
├── services/
│
├── repositories/
│
├── validations/
│
├── types/
│
└── config/

prisma/
│
├── schema.prisma
└── seed.ts
```

---

# 66. Business Logic Organizasyonu

Business logic doğrudan React component içerisine yazılmamalıdır.

Örneğin:

```text
services/order.service.ts

services/product.service.ts
```

kullanılabilir.

Database erişimi için:

```text
repositories/
```

katmanı zorunlu değildir ancak proje büyüdükçe faydalı olacaktır.

---

# 67. Admin Content Architecture

Content sistemi tamamen generic page builder olmamalıdır.

Bu V1 için overengineering olur.

Bunun yerine iki yöntem kullanılabilir:

## Structured content

Hero gibi UI yapısı belli alanlar:

```text
title
description
image
button
```

şeklinde structured olarak tutulmalıdır.

## Rich text

KVKK gibi serbest metin sayfaları:

```text
CmsPage.content
```

içerisinde tutulabilir.

Bu iki yaklaşım birlikte kullanılmalıdır.

---

# 68. V1 MVP Kapsamı

V1 içerisinde bulunacaktır:

* storefront
* responsive navigation
* ana sayfa
* hero CMS
* ürün listeleme
* kategori
* ürün detay
* ürün görselleri
* sepet
* checkout
* sipariş oluşturma
* sipariş başarı ekranı
* IBAN
* WhatsApp
* admin login
* dashboard
* ürün CRUD
* kategori CRUD
* sipariş yönetimi
* firma ayarları
* iletişim ayarları
* logo yönetimi
* footer CMS
* homepage CMS
* KVKK CMS
* gizlilik politikası CMS
* mesafeli satış CMS
* teslimat/iade CMS

---

# 69. V1 Dışı Özellikler

Aşağıdaki özellikler V1 kapsamında değildir:

* kredi kartı
* ödeme gateway
* iyzico
* PayTR
* Stripe
* kullanıcı üyeliği
* müşteri login
* favoriler
* yorum sistemi
* puanlama
* kupon
* kampanya motoru
* sadakat sistemi
* gelişmiş stok ERP
* otomatik fatura
* muhasebe entegrasyonu
* kargo API
* WhatsApp Business API
* SMS
* e-posta otomasyonu
* çoklu dil
* çoklu para birimi
* gelişmiş analytics
* ERP entegrasyonu
* marketplace entegrasyonu

---

# 70. Geleceğe Hazırlık

V1 sade tutulacak ancak ileride aşağıdaki modüllerin eklenebilmesini engelleyen mimari kararlar verilmemelidir:

```text
Online Payment
Customer Accounts
Stock Management
Variants
Coupons
Cargo
Invoice
WhatsApp Business API
CRM
Analytics
```

Ancak V1 içerisinde bunlar için kullanılmayan soyutlama katmanları oluşturulmamalıdır.

---

# 71. Performance

Ana ürün sayfalarında performans önceliklidir.

Minimum:

* Next/Image
* optimized image loading
* lazy loading
* responsive image sizes
* server components uygun alanlarda kullanılmalı
* gereksiz client component kullanımından kaçınılmalı
* mümkün olduğunca az JavaScript

hedeflenmelidir.

---

# 72. Accessibility

Minimum:

* semantic HTML
* keyboard navigation
* form label'ları
* alt text
* button semantics
* yeterli contrast
* focus states

uygulanmalıdır.

---

# 73. Acceptance Criteria — Product

## PROD-001

Admin yeni ürün oluşturabilmelidir.

## PROD-002

Yeni ürün default olarak draft olabilir.

## PROD-003

Aktif ürün public sitede görünmelidir.

## PROD-004

Pasif ürün public sitede görünmemelidir.

## PROD-005

Bir ürüne birden fazla görsel eklenebilmelidir.

## PROD-006

Ürünün kapak görseli seçilebilmelidir.

## PROD-007

Ürün slug unique olmalıdır.

---

# 74. Acceptance Criteria — Order

## ORD-001

Müşteri sepette en az bir ürün varsa sipariş verebilmelidir.

## ORD-002

Sipariş sırasında ürün fiyatları server tarafından tekrar alınmalıdır.

## ORD-003

Order ve OrderItem transaction içerisinde oluşturulmalıdır.

## ORD-004

Sipariş ilk olarak PENDING durumunda oluşmalıdır.

## ORD-005

Başarılı sipariş sonrasında benzersiz sipariş numarası gösterilmelidir.

## ORD-006

Admin sipariş durumunu değiştirebilmelidir.

## ORD-007

Admin siparişe özel not ekleyebilmelidir.

---

# 75. Acceptance Criteria — CMS

## CMS-001

Admin firma adını değiştirdiğinde storefront ilgili alanlarda yeni firma adı görünmelidir.

## CMS-002

Admin logo değiştirdiğinde storefront yeni logo kullanmalıdır.

## CMS-003

Admin hero başlığını ve açıklamasını değiştirebilmelidir.

## CMS-004

Admin hero görselini değiştirebilmelidir.

## CMS-005

Admin footer iletişim bilgilerini değiştirebilmelidir.

## CMS-006

Admin WhatsApp numarasını değiştirebilmelidir.

## CMS-007

Admin KVKK metnini değiştirebilmelidir.

## CMS-008

Admin gizlilik politikası metnini değiştirebilmelidir.

## CMS-009

Admin mesafeli satış sözleşmesini değiştirebilmelidir.

## CMS-010

Yasal içerik değişikliklerinde deploy gerekmemelidir.

---

# 76. Acceptance Criteria — Bank

## BANK-001

Admin IBAN ekleyebilmelidir.

## BANK-002

Admin IBAN düzenleyebilmelidir.

## BANK-003

Admin banka hesabını pasif hale getirebilmelidir.

## BANK-004

Sipariş sonrası yalnızca aktif banka hesapları gösterilmelidir.

## BANK-005

Kullanıcı tek tıklamayla IBAN kopyalayabilmelidir.

---

# 77. Acceptance Criteria — WhatsApp

## WA-001

Admin WhatsApp numarasını değiştirebilmelidir.

## WA-002

Ürün detayındaki WhatsApp butonu ürün adı ve kodunu mesaja eklemelidir.

## WA-003

Sipariş sonrası WhatsApp butonu sipariş numarasını mesaja eklemelidir.

---

# 78. Seed Data

Development ortamında örnek:

```text
1 admin
3 kategori
6 ürün
1 banka hesabı
default site settings
default CMS pages
```

seed edilmelidir.

Production credential seed içerisine sabit yazılmamalıdır.

---

# 79. Environment Variables

Minimum:

```text
DATABASE_URL

AUTH_SECRET

NEXT_PUBLIC_SITE_URL

STORAGE_ENDPOINT
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
STORAGE_BUCKET
STORAGE_PUBLIC_URL
```

Gerçek secret değerleri repository içerisinde tutulmamalıdır.

---

# 80. Definition of Done

V1 tamamlanmış kabul edilmesi için:

* public storefront çalışıyor,
* mobile responsive,
* ürünler database'den geliyor,
* kategoriler çalışıyor,
* ürün detayları çalışıyor,
* sepet kalıcı,
* checkout çalışıyor,
* sipariş database'e yazılıyor,
* OrderItem snapshot alıyor,
* admin login çalışıyor,
* sipariş yönetimi çalışıyor,
* ürün CRUD çalışıyor,
* kategori CRUD çalışıyor,
* CMS çalışıyor,
* logo değiştirilebiliyor,
* hero değiştirilebiliyor,
* footer değiştirilebiliyor,
* firma bilgileri değiştirilebiliyor,
* WhatsApp değiştirilebiliyor,
* IBAN değiştirilebiliyor,
* KVKK değiştirilebiliyor,
* gizlilik metni değiştirilebiliyor,
* mesafeli satış sözleşmesi değiştirilebiliyor,
* admin değişiklikleri deploy olmadan storefront'a yansıyor,
* production build hata vermiyor

olmalıdır.

---

# 81. Nihai Ürün Prensibi

Bu projenin amacı özellik sayısını artırmak değildir.

Temel ürün prensibi:

> Ürünü göster, güven oluştur, müşterinin sipariş talebini mümkün olan en düşük sürtünmeyle al ve satış görüşmesini firma ile müşteri arasında devam ettir.

Teknik prensip:

> Basit olanı basit tut.

Tasarım prensibi:

> Site bir AI tarafından oluşturulmuş generic SaaS template'i gibi değil, profesyonel bir butik mobilya markasının dijital kataloğu gibi görünmelidir.

V1 boyunca bu üç prensip kapsam ve teknik kararların temel referansı olacaktır.
