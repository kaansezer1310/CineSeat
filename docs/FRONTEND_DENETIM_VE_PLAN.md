# CineSeat Frontend — Denetim ve Uygulama Planı

> **Tarih:** Ağustos 2026
> **Kapsam:** `frontend/` dizininin tamamı (88 kaynak dosya)
> **Yöntem:** Test/lint/build çalıştırıldı, kod tabanı tarandı; her bulgu dosya ve satır kanıtına dayanıyor.
> **Durum:** Plan onaya hazır, uygulama başlamadı.
> **İlgili belge:** Karar bekleyen maddeler için → [`FRONTEND_TARTISILACAKLAR.md`](./FRONTEND_TARTISILACAKLAR.md)

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
seatService.js        → dosya içi sabit dizi (initialReservedSeats)
campaignService.js    → dosya içi MOCK_CAMPAIGNS
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
| Kimlik doğrulama | ✅ `authService.js` — gerçek API | Auth |
| Filmler | ✅ `movieService.js` — gerçek API | Movies |
| Seanslar | ❌ `sessionService.js` → `src/data/` | Showtimes |
| Yorumlar | ❌ `commentService.js` → `src/data/` | Comments |
| Puanlar | ❌ `ratingService.js` → localStorage | ⚠️ Ayrı modül **yok** — `Comment.Rating` |
| Koltuklar | ❌ `seatService.js` → dosya içi mock | Seats + SeatLocks |
| Rezervasyon | ❌ `reservationService.js` → localStorage | Reservations |
| Kampanyalar | ❌ `campaignService.js` → dosya içi mock | Campaigns |
| **Favoriler** | ❌ `WatchlistProvider.jsx` → localStorage | UserFavorites |
| **Sinemalar** | ❌ `CinemasPage.jsx` → dosya içi `const CINEMAS` | Cinemas + Cities + Districts |
| **Profil düzenleme** | ❌ Frontend'de **hiç yok** | `PUT /api/profile` |

Son üç satır servis dosyası değil, o yüzden ilk taramada gözden kaçmıştı —
ama aynı sorunu taşıyorlar. Pratik sonuçları:

- **Favoriler** yalnızca o tarayıcıda duruyor; kullanıcı telefondan girince listesi boş.
- **Sinemalar** ekranı veritabanındaki gerçek sinema kayıtlarını göstermiyor.
- **Profil** bilgileri görüntülenebiliyor ama güncellenemiyor.

> ⚠️ Puan satırı bir model uyuşmazlığı — karar gerektiriyor
> → [`FRONTEND_TARTISILACAKLAR.md` · T10](./FRONTEND_TARTISILACAKLAR.md)

---

### 2.2 Yüksek — kullanımı bozanlar

#### Y1 · Admin paneli mobilde kullanılamıyor
Admin stil dosyasında tek bir duyarlı kural yok. 260 piksel sabit kenar çubuğu
ve 7 sütunlu tablo dar ekranda yatay taşmaya sebep oluyor.

```
admin.css → 245 satır, @media kuralı: 0
App.css   → 2423 satır, @media kuralı: 12   (karşılaştırma)
```

#### Y2 · Giriş sonrası hedef sayfaya dönülmüyor
Korumalı bir sayfaya tıklayan kullanıcı giriş ekranına atılıyor, giriş yaptıktan
sonra ana sayfaya bırakılıyor. Nereye gitmek istediği unutuluyor; ayrıca neden
yönlendirildiğine dair açıklama da gösterilmiyor.

```
LoginPage.jsx:22 ve :58 → navigate("/", { replace: true })
ProtectedRoute.jsx:21   → hedef konum saklanmıyor
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
AdminMovieForm.jsx  → 4 çağrı (satır 48, 71, 74, 79)
AdminMoviesPage.jsx → 3 çağrı (satır 19, 23, 27)
```

#### Y6 · Tür filtresi hiçbir sonuç üretmiyor
Backend'in film listesi tür bilgisi taşımıyor; tür ayrı bir uç noktadan geliyor.
Liste ekranında her film için ayrı istek atmamak adına tür alanı boş bırakılmış.

```
movieService.js:52 → genre: genres.length > 0 ? … : ""
```

> ⚠️ Bu bulgunun kalıcı çözümü backend kararına bağlı → [`FRONTEND_TARTISILACAKLAR.md` · T1](./FRONTEND_TARTISILACAKLAR.md)

---

### 2.3 Orta — tutarlılık ve bakım

#### O1 · Sinemalar sayfasına iki farklı yoldan giriliyor
Aynı sayfa hem `/cinemas` rotası hem ana sayfada bir sekme olarak render
ediliyor. Sekmeye geçildiğinde adres değişmiyor: bağlantı paylaşılamıyor, geri
tuşu beklendiği gibi çalışmıyor, `/cinemas` rotasına menüden hiç ulaşılamıyor.

```
App.jsx:45     → <Route path="/cinemas" …>
HomePage.jsx:13 → import CinemasPage   (sekme içeriği olarak)
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
Türkçe   → /odeme, /odeme-hata
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
#0c0912  zemin        #1b1425  yüzey
#d0ac59  eylem        #8765a3  ikincil
#71947c  olumlu       #d77b82  hata
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

## 4. Uygulama planı

Fazlar bağımlılık sırasına göre: navigasyon onarımı en ucuz ve en görünür
kazanç, o yüzden önce. Backend entegrasyonu en pahalısı ve başkalarının
kararına bağlı, o yüzden sonra — ama tasarım işi onu beklemeden ilerleyebilir.

### Faz 1 — Navigasyonu onar · ~yarım gün

Küçük dokunuşlar, en yüksek etki. Hiçbiri backend'e bağlı değil.

- [ ] Ana menüye **admin rolü için Yönetim bağlantısı** ekle
- [ ] Admin kabuğuna **üst çubuk** koy: kullanıcı adı, siteye dön, çıkış
- [ ] Tüm menülerde `Link` yerine **`NavLink`**, aktif duruma stil ver
- [ ] Giriş sonrası **hedef sayfaya dön** (`location.state.from`), yönlendirme sebebini göster
- [ ] Sinemalar sekmesini **URL'ye bağla** ya da tek bir rotaya indir
- [ ] Admin ağacına **kendi 404 sayfasını** ekle
- [ ] Rota adlarını tek dile çek, eskisinden yönlendirme bırak

**Kapattığı bulgular:** K2 · K3 · Y2 · Y4 · O1 · O4 · O5

---

### Faz 2 — Bileşen setini kur · ~1–2 gün

Ekranları yeniden çizmeden önce, ekranların kullanacağı parçalar.

- [ ] Bölüm 3.5'teki **altı bileşeni** yaz, her birine test ekle
- [ ] `alert()` / `confirm()` çağrılarını **Toast ve ConfirmDialog** ile değiştir
- [ ] Tanımsız dört CSS sınıfını **gerçek stillerle** karşıla
- [ ] 15 satır içi stili **tokenlara** taşı

**Kapattığı bulgular:** Y3 · Y5 · O3

---

### Faz 3 — Admin ekranlarını yeniden tasarla · ~2–3 gün

"Makine dairesi" yönünü uygula. Bileşenler hazır olduğu için bu faz büyük
ölçüde birleştirme işi.

- [ ] Kenar çubuğunu **bölümlere ayır** (Raporlar / Katalog / Salonlar), aktif durumu göster
- [ ] Dashboard'a **doluluk ızgarasını** ekle, çubuk grafiği ikinci sıraya al
- [ ] Film tablosunu **`DataTable`**'a geçir: arama, sıralama, sayfalama, boş durum
- [ ] Film formunu **iki sütuna** böl, alan bazlı hata mesajları ekle
- [ ] **Duyarlı kurallar yaz**: kenar çubuğu dar ekranda açılır menüye, tablo karta dönsün

**Kapattığı bulgular:** Y1 ve tasarım şikâyetinin tamamı

---

### Faz 4 — Entegrasyonu tamamla · ~6–9 gün + backend koordinasyonu

En pahalı faz ve tek başına frontend işi değil. Bu faz bittiğinde frontend'de
mock veri kalmamalı.

**Rezervasyon zinciri** *(en büyük kalem — T2 kararına bağlı)*
- [ ] **Seanslar**: `sessionService` → `GET /api/showtimes`
- [ ] **Koltuklar**: `seatService` → gerçek koltuk + `SeatLock` uç noktaları
- [ ] **Rezervasyon**: ödeme akışı → `POST /api/reservations`
- [ ] **Kampanyalar**: `campaignService` → `GET /api/campaigns`, indirim backend'de hesaplansın

**İçerik ve kullanıcı**
- [ ] **Yorumlar**: `commentService` → `GET/POST /api/movies/{id}/comments`
- [ ] **Puanlar**: `ratingService` → T10 kararına göre *(yorumla birleşecek mi?)*
- [ ] **Favoriler**: `WatchlistProvider` → `UserFavorites` uç noktaları *(localStorage kalkacak)*
- [ ] **Profil**: görüntüleme `GET /api/profile`, düzenleme `PUT /api/profile` *(bugün hiç yok)*

**Katalog ve yönetim**
- [ ] **Sinemalar**: `CinemasPage` içindeki sabit dizi → `GET /api/cinemas` + şehir filtresi
- [ ] **Dashboard**: gerçek rezervasyon verisine bağlan *(T3'teki yeni uç gerekiyor)*

> ⚠️ Bu fazın önünde **çözülmemiş bağımlılıklar** var. Başlamadan önce
> [`FRONTEND_TARTISILACAKLAR.md`](./FRONTEND_TARTISILACAKLAR.md) maddelerinin
> karara bağlanması gerekiyor — özellikle **T1, T2, T3 ve T10**.

**Kapattığı bulgular:** K1 · K4 · K5 · Y6

---

### Faz 5 — Cila · ~1 gün

- [ ] Admin rotalarını **tembel yükle** (`React.lazy`) — grafik kütüphaneleri ana paketten çıksın
- [ ] Klavye ile gezinme ve **görünür odak halkası** kontrolü
- [ ] Yükleniyor iskeletleri ve **hata sınırları**
- [ ] Kalan `console` çağrılarını temizle

**Kapattığı bulgular:** O2

---

## 5. Bitti sayılma ölçütü

Her fazın sonunda:

- Testler yeşil, lint temiz, build başarılı *(bunlar zaten sağlanıyor — bozulmamalı)*
- Yeni her bileşenin testi yazılmış
- Yeni her ekran **360 piksel** genişlikte kontrol edilmiş
- Yeni her ekran **klavyeyle** baştan sona gezilebiliyor

Faz 4 bittiğinde ölçüt tek cümle:

> **Tarayıcı verisi silindiğinde hiçbir rezervasyon kaybolmuyor.**

---

## 6. Tahmini toplam

| Faz | Süre | Backend bağımlılığı |
|---|---|---|
| 1 — Navigasyon | ~0,5 gün | Yok |
| 2 — Bileşenler | ~1–2 gün | Yok |
| 3 — Admin tasarımı | ~2–3 gün | Yok |
| 4 — Entegrasyon | ~6–9 gün | **Var — önce karar gerekiyor** |
| 5 — Cila | ~1 gün | Yok |
| **Toplam** | **~11–16 gün** | |

**Faz 1–3 (yaklaşık 4–6 gün) backend'e hiç dokunmadan tamamlanabilir** ve
şikâyet edilen iki sorunun (navigasyon, admin tasarımı) ikisini de kapatır.
Faz 4 ise karar bekliyor — bu yüzden ikisi paralel yürütülebilir: kararlar
konuşulurken tasarım işi ilerler.

> **Not:** Faz 4 tahmini, planın ilk sürümünde 3–5 gündü. Kapsam gözden
> geçirildiğinde kampanya, favori, sinema ve profil entegrasyonlarının
> atlandığı görüldü; tahmin buna göre düzeltildi. Bu dört madde ile T4'te
> karara bağlanacak admin kapsamı (özellikle seans yönetimi) süreyi
> etkileyen iki ana belirsizlik.
