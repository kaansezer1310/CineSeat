# CineSeat Frontend — Denetim ve Uygulama Planı

> **Tarih:** Ağustos 2026
> **Kapsam:** `frontend/` dizininin tamamı (88 kaynak dosya)
> **Yöntem:** Test/lint/build çalıştırıldı, kod tabanı tarandı; her bulgu dosya ve satır kanıtına dayanıyor.
> **Durum:** T1–T10 kararları netleşti; iki kişilik uygulama planı hazır, uygulama başlamadı.
> **İlgili belge:** Kararların arka planı için → [`FRONTEND_TARTISILACAKLAR.md`](./FRONTEND_TARTISILACAKLAR.md)

---

## 1. Özet

Otomatik kontrollerin tamamı geçiyor:

| Kontrol | Sonuç |
|---|---|
| `npm run test:run` | **188 / 188 test geçiyor** (24 dosya) |
| `npm run lint` | **0 hata, 0 uyarı** |
| `npm run build` | **Başarılı** (4.93 sn) |

Buna rağmen ürün, gerçek bir kullanıcı akışında çalışmıyor. Sebep, testlerin
kötü olması değil — testler doğru şeyleri ölçüyor. Ölçülmeyen şey uygulamanın
bütünü: servislerin gerçekten backend'e gidip gitmediği, sayfalar arasında
gezilebilirlik ve yönetim panelinin kullanılabilirliği.

**En kritik tek cümle:** Bir kullanıcı bugün koltuk seçip ödeme akışını
tamamlayabiliyor ve o rezervasyon veritabanına hiç ulaşmıyor — tarayıcının
`localStorage`'ında kalıyor.

### 1.1 Karara bağlanan maddeler

24 Ağustos 2026 itibarıyla T1–T10 için aşağıdaki kararlar geçerlidir. Bu tablo,
`FRONTEND_TARTISILACAKLAR.md` içindeki “karar bekleniyor” notlarının yerine geçer.

| # | Karar | Plana etkisi |
|---|---|---|
| **T1** | **A — `MovieDto` tür listesini taşıyacak.** | Film listesi tek istekte türleri alacak; tür filtresi korunacak ve gerçek veriyle çalışacak. |
| **T2** | **A — Frontend backend modeline uyarlanacak.** | Mock string koltuk kodu anahtar olmaktan çıkacak; `SeatId`, `HallId` ve `SeatLock` kullanılacak. |
| **T3** | **İzni kullanan uç yazılacak.** | `GET /api/reservations` sayfalama ve filtrelerle eklenecek; rol sabiti yerine `reservation.read` policy'siyle korunacak. |
| **T4** | **C — Tam admin kapsamı.** | Film ve seanslara ek olarak sinema/salon/koltuk, kampanya, yorum moderasyonu ve kullanıcı yönetimi teslim kapsamına girdi. |
| **T5** | **İzin sistemi devreye alınacak.** | Backend policy'leri, oturumdaki izin bilgisi, frontend menü/rota/eylem kontrolleri birlikte uygulanacak. |
| **T6** | **Şimdilik simülasyon; ileride gerçek servis.** | Ödeme katmanı değiştirilebilir bir adaptör olacak. Form gerçekçi kart doğrulamaları yapacak; ham kart verisi saklanmayacak veya loglanmayacak. |
| **T7** | **Tavsiye edilen soft-delete uygulanacak.** | Silme yerine arşivleme kullanılacak; metinler ve onay diyaloğu buna göre değişecek. |
| **T8** | **İngilizce rotalar.** | Kanonik yollar `/payment` ve `/payment-error` olacak; eski Türkçe adresler yönlendirilecek. |
| **T9** | **B — Sinemalar ayrı sayfa.** | Ana sayfadaki sinema sekmesi kalkacak; menüden `/cinemas` sayfasına gidilecek. |
| **T10** | **C — Yorum içeriği isteğe bağlı.** | Puan aynı `Comment` kaydında kalacak; yıldız zorunlu, metin isteğe bağlı ve kullanıcı/film başına tek kayıt olacak. |

Kararlar tamamlandığı için geliştirme artık toplantı beklemiyor. Backend sözleşmesi
gerektiren işler, arayüz işleriyle iki ayrı hatta paralel yürütülecek.

---

## 2. Bulgular

16 bulgu, önem sırasına göre. Her biri doğrulandı.

### 2.1 Kritik — ürünü işlevsiz bırakanlar

#### K1 · Rezervasyonlar backend'e hiç ulaşmıyor
Koltuk seçimi, sepet ve ödeme akışının tamamı tarayıcı belleğinde çalışıyor.
Kullanıcı bilet aldığını sanıyor; veritabanında iz yok. Farklı bir tarayıcıdan
girildiğinde rezervasyon kayboluyor, iki kullanıcı aynı koltuğu alabiliyor.

```
reservationService.js → localStorage anahtarı "cineseat-reservations"
seatService.js → dosya içi sabit dizi (initialReservedSeats)
campaignService.js → dosya içi MOCK_CAMPAIGNS
```

#### K2 · Admin paneline arayüzden girilemiyor
Admin rolüyle giriş yapan kullanıcı için menüde hiçbir şey değişmiyor. Panele
ulaşmanın tek yolu adres çubuğuna `/admin` yazmak.

```
grep 'to="/admin' → Layout.jsx içinde 0 sonuç
```

#### K3 · Admin panelinden çıkış yolu yok
`AdminLayout.jsx` 27 satır ve yalnızca iki iç link içeriyor. Siteye dönüş,
oturum kapatma veya kullanıcı kimliği bilgisi yok. Panele giren kullanıcı,
tarayıcının geri tuşu dışında sıkışıyor.

#### K4 · Yönetici raporu uydurma sayılar gösteriyor
Dashboard'daki bilet ve gelir rakamları, o tarayıcının `localStorage`'ındaki
sahte rezervasyonlardan hesaplanıyor. CSV dışa aktarımı aynı veriyi gerçekmiş
gibi dışarı veriyor.

```
AdminDashboard.jsx:36 → reservationService.getAllReservations()
```

#### K5 · Frontend'in çoğu hâlâ sahte veride
Yalnızca kimlik doğrulama ve film servisleri gerçek API'ye bağlandı. Geri kalan
her şey — servisler ve bazı servis olmayan bileşenler — mock veride çalışıyor.

| Alan | Frontend | Backend'de karşılığı |
|---|---|---|
| Kimlik doğrulama | [x] `authService.js` — gerçek API | Auth |
| Filmler | [x] `movieService.js` — gerçek API | Movies |
| Seanslar | [yok] `sessionService.js` → `src/data/` | Showtimes |
| Yorumlar | [yok] `commentService.js` → `src/data/` | Comments |
| Puanlar | [yok] `ratingService.js` → localStorage | [dikkat] Ayrı modül **yok** — `Comment.Rating` |
| Koltuklar | [yok] `seatService.js` → dosya içi mock | Seats + SeatLocks |
| Rezervasyon | [yok] `reservationService.js` → localStorage | Reservations |
| Kampanyalar | [yok] `campaignService.js` → dosya içi mock | Campaigns |
| **Favoriler** | [yok] `WatchlistProvider.jsx` → localStorage | UserFavorites |
| **Sinemalar** | [yok] `CinemasPage.jsx` → dosya içi `const CINEMAS` | Cinemas + Cities + Districts |
| **Profil düzenleme** | [yok] Frontend'de **hiç yok** | `PUT /api/profile` |

Son üç satır servis dosyası değil, o yüzden ilk taramada gözden kaçmıştı —
ama aynı sorunu taşıyorlar. Pratik sonuçları:

- **Favoriler** yalnızca o tarayıcıda duruyor; kullanıcı telefondan girince listesi boş.
- **Sinemalar** ekranı veritabanındaki gerçek sinema kayıtlarını göstermiyor.
- **Profil** bilgileri görüntülenebiliyor ama güncellenemiyor.

> [x] **T10 kararı:** Puan `Comment.Rating` alanında kalacak; yorum metni isteğe
> bağlı olacak. Ayrı `ratingService` kaldırılacak.

---

### 2.2 Yüksek — kullanımı bozanlar

#### Y1 · Admin paneli mobilde kullanılamıyor
Admin stil dosyasında tek bir duyarlı kural yok. 260 piksel sabit kenar çubuğu
ve 7 sütunlu tablo dar ekranda yatay taşmaya sebep oluyor.

```
admin.css → 245 satır, @media kuralı: 0
App.css → 2423 satır, @media kuralı: 12 (karşılaştırma)
```

#### Y2 · Giriş sonrası hedef sayfaya dönülmüyor
Korumalı bir sayfaya tıklayan kullanıcı giriş ekranına atılıyor, giriş yaptıktan
sonra ana sayfaya bırakılıyor. Nereye gitmek istediği unutuluyor; ayrıca neden
yönlendirildiğine dair açıklama da gösterilmiyor.

```
LoginPage.jsx:22 ve :58 → navigate("/", { replace: true })
ProtectedRoute.jsx:21 → hedef konum saklanmıyor
```

#### Y3 · Dört CSS sınıfı tanımsız
Admin sayfaları bu sınıf adlarını veriyor, karşılığında hiçbir stil yok:

```
admin-dashboard · admin-movies-page · admin-movie-form-page · admin-table-actions
```

#### Y4 · Aktif sayfa göstergesi hiç yok
Projede `NavLink` kullanılmamış. Ne ana menüde ne admin kenar çubuğunda aktif
sayfa vurgulanıyor.

```
grep 'NavLink' → tüm projede 0 sonuç
```

#### Y5 · Tarayıcı uyarı kutuları ürün diline aykırı
Silme onayı ve başarı mesajları için `alert()` / `confirm()` kullanılıyor.
Temaya uymuyor, mobilde kötü duruyor, sayfayı bloke ediyor.

```
AdminMovieForm.jsx → 4 çağrı (satır 48, 71, 74, 79)
AdminMoviesPage.jsx → 3 çağrı (satır 19, 23, 27)
```

#### Y6 · Tür filtresi hiçbir sonuç üretmiyor
Backend'in film listesi tür bilgisi taşımıyor; tür ayrı bir uç noktadan geliyor.
Liste ekranında her film için ayrı istek atmamak adına tür alanı boş bırakılmış.

```
movieService.js:52 → genre: genres.length > 0 ? … : ""
```

> [x] **T1 kararı:** Tür listesi `MovieDto`'ya eklenecek; filtre kaldırılmayacak.

---

### 2.3 Orta — tutarlılık ve bakım

#### O1 · Sinemalar sayfasına iki farklı yoldan giriliyor
Aynı sayfa hem `/cinemas` rotası hem ana sayfada bir sekme olarak render
ediliyor. Sekmeye geçildiğinde adres değişmiyor: bağlantı paylaşılamıyor, geri
tuşu beklendiği gibi çalışmıyor, `/cinemas` rotasına menüden hiç ulaşılamıyor.

```
App.jsx:45 → <Route path="/cinemas" …>
HomePage.jsx:13 → import CinemasPage (sekme içeriği olarak)
```

#### O2 · Grafik kütüphaneleri her ziyaretçiye iniyor
Uygulama tek parça paketleniyor. Yalnızca admin panelinde kullanılan `recharts`
ve `react-csv`, siteye giren herkese indiriliyor.

```
dist/assets/index.js → 717.44 kB (gzip 212.93 kB)
Vite uyarısı: "Some chunks are larger than 500 kB after minification"
```

#### O3 · Satır içi stiller stil sisteminin dışında
Renk ve düzen kararları sekiz dosyada JSX içine gömülü; tema değiştiğinde
birlikte değişmiyor.

```
15 adet style={{…}} → Layout, MovieCard, SeatMap, CartPage,
 CinemasPage, MovieDetailsPage, PaymentErrorPage, ProfilePage
```

#### O4 · Rota adları iki dil arasında gidip geliyor
```
Türkçe → /odeme, /odeme-hata
İngilizce → /booking, /cart, /success, /movies, /cinemas, /profile
```

#### O5 · Admin bölümünün kendi 404 ekranı yok
Var olmayan bir admin adresi kullanıcıyı admin kabuğundan çıkarıp genel site
şablonundaki 404 sayfasına düşürüyor.

```
App.jsx:54 → path="*" yalnızca Layout altında; /admin ağacında karşılığı yok
```

---

## 3. Admin paneli — tasarım yönü

Panelin "basit duruyor" olmasının sebebi renk seçimi değil; projenin renk
sistemi (`index.css`, açık/koyu tema tokenları) zaten sağlam. Sebep şu: **admin
paneli, müşteri sitesinin küçültülmüş bir kopyası gibi davranıyor.** Oysa
ikisinin işi farklı.

### 3.1 Ayrım: salon ve makine dairesi

| | Müşteri sitesi — *salon* | Admin paneli — *makine dairesi* |
|---|---|---|
| Amaç | Hissettirmek, bilet sattırmak | Hızlı iş yapmak |
| Yoğunluk | Geniş, afiş odaklı, nefes alan | Sıkı, tablo odaklı, taranabilir |
| Altın renk | Vurgu ve atmosfer | **Yalnızca** tıklanabilir / canlı öğeler |
| Bugünkü hâli | Amacına uygun | Amacını ıskalıyor |

### 3.2 Renk — mevcut tokenlar, daha disiplinli kullanım

Yeni palet gerekmiyor. Değişen tek şey **altın rengin nerede kullanıldığı**:
bugün başlıklarda dekoratif olarak kullanılıyor, bundan sonra yalnızca eyleme
dönük öğelerde. Durum renkleri (başarı / uyarı / hata) vurgu renginden ayrı
tutulmalı.

```
#0c0912 zemin #1b1425 yüzey
#d0ac59 eylem #8765a3 ikincil
#71947c olumlu #d77b82 hata
```

### 3.3 Tipografi

Admin paneli sayı ve kimlik dolu bir ekran. Tek başına en büyük okunabilirlik
kazancı, tablolardaki ve sayaçlardaki rakamlara sabit genişlik vermek:

```css
font-variant-numeric: tabular-nums;
```

Üç rol yeterli: başlık yüzü, gövde yüzü, kimlik/dosya yolları için mono yüz.

### 3.4 İmza öğe — doluluk ızgarası

Dashboard'daki genel amaçlı çubuk grafik, herhangi bir yönetim panelinde
olabilecek bir öğe. Bir sinemanın kendi görsel dili ise **koltuk planı**.
Seans bazlı doluluk oranını koltuk ızgarası biçiminde göstermek hem konuya özgü
hem de işletmeci için daha okunaklı: hangi seansın dolduğu tek bakışta görülür.
Çubuk grafik kalkmıyor, ikinci sıraya iniyor.

### 3.5 Eksik bileşenler

Panelin "bitmemiş" hissi vermesinin somut sebebi, her ekranın kendi çözümünü
uydurması. Şu altı bileşen bir kez yazılıp her yerde kullanılmalı:

| Bileşen | İşi |
|---|---|
| `PageHeader` | Başlık, açıklama, birincil eylem — tek düzen |
| `DataTable` | Sıralama, boş durum, yükleniyor iskeleti, mobilde kart görünümü |
| `ConfirmDialog` | `confirm()` yerine — odak tuzaklı, temalı |
| `Toast` | `alert()` yerine — engellemeyen bildirim |
| `EmptyState` | "Henüz kayıt yok" için eyleme çağıran ekran |
| `StatCard` | Sayı, etiket, isteğe bağlı değişim göstergesi |

---

## 4. Uygulama planı — iki kişilik ekip

Plan iki paralel sahiplik hattına ayrıldı. İsimler netleşene kadar görevlerde
`Kişi 1` ve `Kişi 2` kullanılacak; uzmanlık başlıkları işin tek kişide kilitlenmesi
anlamına gelmez. Her işin sahibi kodu yazar, diğer kişi inceleme ve kabul testini yapar.

| Kişi | Ana sahiplik | İkincil sorumluluk |
|---|---|---|
| **Kişi 1 — Arayüz ve deneyim** | Navigasyon, ortak bileşenler, responsive admin kabuğu, formlar, erişilebilirlik | API tüketimi ve bileşen testleri |
| **Kişi 2 — Veri ve yetkilendirme** | Backend sözleşmeleri, izin policy'leri, servis entegrasyonları, rezervasyon/koltuk veri akışı | Admin veri ekranları ve entegrasyon testleri |

> **Tahmin yöntemi:** “Efor” toplam kişi-gününü, “takvim” iki kişinin bağımlı
> işleri paralel yürüttüğü çalışma süresini gösterir. API sözleşmesi tamamlanan
> her modül bekletilmeden arayüz hattına devredilir.

### Faz 1 — Navigasyon ve yetkilendirme temeli · 1 kişi-gün / ~0,5–1 takvim günü

**Kişi 1 — Arayüz ve rota sahipliği**

- [x] Ana menüde gerekli izne sahip kullanıcıya **Yönetim** bağlantısını göster
- [x] Admin kabuğuna kullanıcı adı, siteye dönüş ve çıkış içeren **üst çubuk** ekle
- [x] Menüleri `NavLink`'e geçir; aktif durumu görünür yap
- [x] Korumalı sayfadan girişe gelen kullanıcıyı `location.state.from` ile hedefe döndür
- [x] T9 uyarınca ana sayfadaki sinema sekmesini kaldır; menüye ayrı **`/cinemas`** bağlantısı ekle
- [x] T8 uyarınca kanonik ödeme rotalarını **`/payment`** ve **`/payment-error`** yap; eski Türkçe rotalardan yönlendir
- [x] Admin ağacına kendi 404 ekranını ekle

**Kişi 2 — İzin sözleşmesi**

- [x] T5 için backend authorization policy'lerini seed edilen izin adlarıyla kaydet
- [x] Oturum/JWT veya profil cevabında kullanıcının izinlerini frontend'e güvenli biçimde aktar
- [x] Frontend için ortak `hasPermission` ve izinli rota/eylem koruyucularının sözleşmesini hazırla

**Kapattığı bulgular:** K2 · K3 · Y2 · Y4 · O1 · O4 · O5

---

### Faz 2 — Ortak bileşen seti · 2–3 kişi-günü / ~1–1,5 takvim günü

**Kişi 1**

- [x] `PageHeader`, `DataTable` ve `EmptyState` bileşenlerini; mobil kart görünümü ve testleriyle yaz
- [x] Tanımsız admin CSS sınıflarını gerçek stillerle karşıla
- [x] Satır içi stilleri tema tokenlarına taşı

**Kişi 2**

- [ ] `ConfirmDialog`, `Toast` ve `StatCard` bileşenlerini; klavye/odak testleriyle yaz
- [ ] `alert()` ve `confirm()` çağrılarını yeni bileşenlerle değiştir
- [ ] Ortak yükleniyor, hata ve yetkisiz durumlarını standardize et

**Ortak kabul:** İki kişi birbirinin bileşenlerini klavye, 360 px görünüm ve test
senaryolarıyla inceleyecek.

**Kapattığı bulgular:** Y3 · Y5 · O3

---

### Faz 3 — Tam admin paneli (T4=C) · 9–11 kişi-günü / ~5–6 takvim günü

**Kişi 1 — Admin kabuğu, raporlar ve içerik**

- [~] Kenar çubuğunu **Raporlar / Katalog / Salonlar / Kullanıcılar** olarak böl; görünürlüğü izinlere bağla
 <br>→ Bölümlü ve izne bağlı menü altyapısı hazır; Raporlar ve Katalog bağlanmış durumda. Salonlar/Kullanıcılar bölümleri, ekranları yazılınca `AdminLayout.jsx` içindeki `NAVIGATION_SECTIONS` dizisine eklenecek.
- [ ] Dashboard'u gerçek veri sözleşmesine hazırla; doluluk ızgarasını ekle, çubuk grafiği ikinci sıraya al
- [~] Film listesi ve formunu `DataTable` + iki sütunlu, alan bazlı doğrulanan form düzenine geçir
 <br>→ Liste `DataTable`'a, form iki sütunlu düzene geçti; etiketler `htmlFor`/`id` ile bağlandı. Alan bazlı doğrulama mesajları, `Toast`/`ConfirmDialog` (Kişi 2 · Faz 2) ile birlikte yapılacak.
- [ ] Yorum moderasyonu ekranını ve izinli moderasyon eylemlerini ekle
- [ ] Kullanıcı listeleme/yönetim ekranlarını ve izinli eylemleri ekle
- [x] Tüm bu ekranların dar ekranda tablo yerine karta dönüşmesini sağla

**Kişi 2 — Operasyon ekranları ve veri adaptörleri**

- [ ] Sinema, şehir ve ilçe yönetimi ekranlarını ekle
- [ ] Salon, koltuk, teknoloji ve salon-teknoloji yönetimi ekranlarını ekle
- [ ] Seans yönetimi ekranını çakışma ve tarih/saat doğrulamalarıyla ekle
- [ ] Kampanya yönetimi ekranını tarih, oran ve uygunluk doğrulamalarıyla ekle
- [ ] T3 ucunu kullanan rezervasyon/bilet liste ve detay görünümünü ekle
- [ ] Her modülün API adaptörünü, izin eşlemesini, boş/yükleniyor/hata durumunu ve testini yaz

**Ortak kabul:** Kişi 1 görsel/erişilebilirlik tutarlılığını, Kişi 2 veri ve izin
tutarlılığını tüm admin modüllerinde çapraz kontrol edecek.

**Kapattığı bulgular:** Y1 ve admin tasarım/kapsam eksiklerinin tamamı

---

### Faz 4 — Gerçek veri entegrasyonu ve ödeme simülasyonu · 9–13 kişi-günü / ~5–7 takvim günü

Bu fazda ödeme sağlayıcısı dışında ürün mock veriden çıkar. İki kişi endpoint
bazlı boru hattı kurar: Kişi 2 sözleşmeyi ve yetkiyi tamamladıkça Kişi 1 aynı
modülün arayüz entegrasyonunu bitirir.

**Kişi 2 — Backend, veri modeli ve güvenlik**

- [x] **T1:** `MovieDto`'ya tür listesini ekle; liste sorgusunu ve testlerini güncelle
- [x] **T2:** Koltuk/seans DTO'larını `SeatId` + `HallId` ile kesinleştir; `SeatLock` edinme, yenileme ve bırakma akışını test et
 <br>→ Düzeltme (24 Ağustos): önceki not "sözleşme tamamlandı" diyordu ama **yenileme ucu yoktu**. `POST /api/seatlocks/renew` eklendi. Ayrıca koltuk haritası için `GET /api/showtimes/{id}/seats` eklendi (salon koltukları + seans bazlı durum). Backend entegrasyon testleri hâlâ bekliyor.
- [x] **T3:** Sayfalama ile tarih/film/durum filtresi sunan `GET /api/reservations` ucunu ekle ve **`reservation.read` policy'siyle** koru
- [x] **T5:** Tüm admin controller eylemlerini ilgili izin policy'lerine geçir; yalnızca UI gizlemeye güvenme
- [x] **T7:** Kalıcı silme yerine `IsDeleted = true` kullanan arşivleme akışını tamamla; gereken kayıtlar için geri alma ucunu ekle
- [x] **T10:** `Comment.Content` doğrulamasını isteğe bağlı yap; puanı zorunlu ve kullanıcı/film başına tek kayıt tut
- [x] Rezervasyon tutarı ve kampanya indirimini backend'de hesapla; istemciden gelen toplamı güvenilir kabul etme

**Kişi 1 — Frontend servisleri ve uçtan uca akış**

- [ ] Seans ve koltuk servislerini gerçek API'ye bağla; seçimi `SeatId` ile, eşzamanlılığı `SeatLock` ile yönet
- [ ] Sepet/rezervasyon akışını `POST /api/reservations` ile tamamla; localStorage rezervasyonlarını kaldır
- [ ] Kampanya, yorum, favori, profil ve sinema verilerini gerçek uçlara bağla
- [ ] Ayrı `ratingService`'i kaldır; yıldız alanını isteğe bağlı metin içeren yorum formuna taşı
- [ ] Tür filtresini T1 ile gelen `MovieDto.genres` verisine bağla
- [ ] Dashboard ve rezervasyon ekranlarını T3 ucuna bağla
- [ ] Arşivleme dilini ve `ConfirmDialog` metinlerini T7'ye göre güncelle; izin yoksa eylemi gösterme

**T6 — Gerçekçi fakat değiştirilebilir ödeme simülasyonu (Kişi 1 sahibi, Kişi 2 inceleyen)**

- [ ] Simüle ve gelecekteki gerçek sağlayıcıların aynı arayüzü kullanacağı bir **payment adapter** sınırı oluştur
- [ ] Ekranda bunun bir **demo ödeme** olduğunu açıkça belirt
- [ ] Kart numarasını boşluklardan arındırıp marka/uzunluk ve **Luhn** kontrolü yap
- [ ] Son kullanma tarihinin biçimini ve gelecekte olmasını; CVV'nin karta göre 3/4 hane olmasını doğrula
- [ ] Kart sahibi adı ve tüm zorunlu alanlar için alan bazlı, erişilebilir hata mesajları göster
- [ ] Başarı, reddedilme, tekrar deneme ve çift gönderim engeli senaryolarını test et
- [ ] Ham kart numarası/CVV'yi localStorage, uygulama logu, analytics veya rezervasyon payload'ına yazma

**Kapattığı bulgular:** K1 · K4 · K5 · Y6

---

### Faz 5 — Cila, çapraz test ve teslim · 2 kişi-günü / ~1 takvim günü

**Kişi 1**

- [x] Admin rotalarını `React.lazy` ile tembel yükle; grafik kütüphanelerini ana paketten çıkar
- [ ] Klavye gezintisi, görünür odak, hata metinleri ve 360 px görünümleri uçtan uca denetle

**Kişi 2**

- [ ] İzin matrisi, arşivleme, rezervasyon sahipliği, `reservation.read` ve eşzamanlı koltuk kilidi için entegrasyon testlerini çalıştır
- [ ] Kalan mock veri ve `console` çağrılarını tarayıp temizle; ödeme simülasyonu istisnasını belgeyle doğrula

**Ortak**

- [ ] Birbirinin işini kod incelemesinden geçir; test, lint ve production build'i temiz kapat
- [ ] Misafir, kullanıcı, kısıtlı yetkili ve tam admin rolleriyle kabul testi yap

**Kapattığı bulgular:** O2 ve sürüm öncesi kalite riskleri

---

### 4.1 Uygulama durumu (24 Ağustos 2026)

Kişi 1'in **Faz 1 ve Faz 2** işleri tamamlandı; Faz 3 ve Faz 5'ten backend
beklemeyen kalemler de birlikte alındı. Kişi 2'nin izin sözleşmesi (T5) ve
Faz 4 backend kalemlerinin çoğu aynı dönemde tamamlandı; iki hat bu sürümde
birleştirildi.

| Kontrol | Önce | Sonra |
|---|---|---|
| `npm run test:run` | 188 / 188 (24 dosya) | **223 / 223 (28 dosya)** |
| `npm run lint` | 0 hata | **0 hata** |
| `npm run build` | 717,44 kB (gzip 212,93) tek parça | **351,90 kB (gzip 107,31)** + ayrı admin parçası |
| `admin.css` `@media` | 0 | **4** |
| Satır içi `style={{…}}` | 15 | **1** (veriden gelen koltuk sütun sayısı) |

**Kapanan bulgular:** K2 · K3 · Y2 · Y3 · Y4 · O1 · O2 · O3 · O4 · O5

**Yetkilendirme — birleşen tek model**

İki hat da izin katmanını paralel yazdı; birleştirmede tek sözleşme bırakıldı:

- `src/constants/permissions.js` tek kaynak. (Kişi 1'in geçici
 `src/domain/permissions.js` dosyası kaldırıldı.)
- Yetki **yalnızca** izin listesinden geliyor. Backend artık izinleri JWT
 claim'i olarak gönderdiği için "admin rolü = tam yetki" geri düşüşü
 kaldırıldı; izinsiz bir admin hesabı panele giremez.
- `AuthProvider` → `permissions` + `hasPermission`.
- `ProtectedRoute` → `allowedRoles`, `requiredPermissions`, `permissionMode`
 ("all" | "any") destekliyor; **giriş gerekiyor** ile **yetki yok** durumlarını
 ayırıyor: misafir `/login`'e hedefi `state.from` ile taşıyarak, yetkisi
 olmayan oturum `/forbidden`'a gidiyor.
- `PermissionGate` koşullu arayüz öğeleri için (ör. ana menüdeki **Yönetim**
 bağlantısı).
- Panele giriş `ADMIN_PERMISSIONS` + `permissionMode="any"`, her admin alt
 ağacı ayrıca kendi izniyle korunuyor.

**Eklenen arayüz yapı taşları**

- `src/components/ui/` — `PageHeader`, `DataTable`, `EmptyState`.
- `DataTable` sıralama (`aria-sort`), yükleniyor iskeleti, boş durum ve dar
 ekranda kart görünümü sağlıyor; DOM tek `<table>` kaldığı için başlık-hücre
 ilişkisi bozulmuyor.

**Sıradaki işler**

- `alert()` / `confirm()` çağrıları yerinde duruyor; `Toast` ve `ConfirmDialog`
 Kişi 2 · Faz 2 kapsamında.
- Dashboard hâlâ `localStorage` rezervasyonlarından besleniyor (K4). `GET
 /api/reservations` (T3) hazır olduğu için bu artık Kişi 1'in Faz 4 işi:
 dashboard ve rezervasyon ekranlarını bu uca bağlamak.
- Frontend servisleri (seans, koltuk, rezervasyon, kampanya, yorum, favori,
 profil, sinema) hâlâ mock veride; backend uçları hazır.
- Sinema/salon, seans, kampanya, yorum moderasyonu ve kullanıcı yönetimi
 admin ekranları yazılınca `AdminLayout.jsx` içindeki `NAVIGATION_SECTIONS`
 dizisine eklenecek.

---

## 5. Bitti sayılma ölçütü

Her fazın sonunda:

- Testler yeşil, lint temiz, production build başarılı
- Yeni her bileşen ve veri akışı için en az bir başarı ve bir hata testi var
- Yeni her ekran **360 piksel** genişlikte ve klavyeyle baştan sona kontrol edildi
- Yetki hem backend policy'sinde uygulanıyor hem frontend'de doğru görünürlük sağlıyor
- İş sahibi dışında diğer kişi kod incelemesi ve kabul kontrolü yaptı

Planın tamamı için:

- Tarayıcı verisi silindiğinde hiçbir rezervasyon veya favori kaybolmuyor
- İki kullanıcı aynı koltuğu eşzamanlı olarak satın alamıyor
- `reservation.read` izni olmayan kullanıcı tüm rezervasyonları okuyamıyor
- Arşivlenen kayıtlar fiziksel olarak silinmiyor ve normal listelerde görünmüyor
- Puan, metinsiz gönderilebiliyor; aynı kullanıcı aynı filme ikinci kayıt açamıyor
- Kanonik rotalar İngilizce, eski ödeme rotaları yönlendirme olarak çalışıyor
- Ödeme simülasyonu gerçekçi doğrulama yapıyor ancak ham kart verisini hiçbir yerde saklamıyor
- Frontend'de ödeme adaptörü dışındaki işlevsel mock veri kaldırılmış

---

## 6. Tahmini toplam ve paralel takvim

| Faz | Toplam efor | İki kişiyle takvim | Ana bağımlılık |
|---|---:|---:|---|
| 1 — Navigasyon + yetki temeli | ~1 kişi-günü | ~0,5–1 gün | İzinlerin oturuma aktarım biçimi |
| 2 — Ortak bileşenler | ~2–3 kişi-günü | ~1–1,5 gün | Faz 1 rota/guard sözleşmesi |
| 3 — Tam admin paneli | ~9–11 kişi-günü | ~5–6 gün | Admin API sözleşmeleri |
| 4 — Entegrasyon + ödeme simülasyonu | ~9–13 kişi-günü | ~5–7 gün | T1–T3/T5/T7/T10 backend işleri |
| 5 — Cila ve teslim | ~2 kişi-günü | ~1 gün | Önceki fazların birleşmesi |
| **Toplam** | **~23–30 kişi-günü** | **~13–17 iş günü** | |

Takvim tahmini, iki kişinin tam zamanlı çalıştığını ve endpointlerin modül modül
teslim edildiğini varsayar. En verimli sıra şöyledir:

1. **Gün 1–2:** Kişi 1 navigasyon/rota işlerini, Kişi 2 izin temelini kapatır; ortak bileşenler başlar.
2. **Gün 3–8:** Kişi 1 admin kabuğu/içerik ekranlarını, Kişi 2 operasyon ekranları ve backend sözleşmelerini paralel yürütür.
3. **Gün 9–15:** Endpoint bazlı devirle rezervasyon, koltuk, içerik ve ödeme akışları gerçek veriye bağlanır.
4. **Gün 16–17:** Çapraz inceleme, erişilebilirlik, güvenlik, regresyon ve build kontrolleri tamamlanır.

> **Kapsam notu:** Önceki ~11–16 günlük tahmin, T4 admin kapsamı kararı ve T5
> izin sisteminin devreye alınması netleşmeden hazırlanmıştı. T4=C ile tam admin
> paneli, izin policy'leri, soft-delete ve gerçekçi ödeme doğrulamaları kapsama
> girdiği için yeni tahmin **~23–30 kişi-günü / iki kişiyle ~13–17 iş günü** oldu.
