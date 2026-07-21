# CineSeat — Çalışma Durumu

> Bu dosya çalışma ilerledikçe güncellenir. Her görev tamamlandığında ilgili bölüm eklenir/güncellenir. Ayrıntılı sprint planı için `docs/PLAN.md`, görev-durum analizi için `docs/WBS_GOREV_DAGILIMI.md`. Mentöre basit dille anlatım için `docs/berke_SPRINT1_ACIKLAMA.md`.

**Son güncelleme:** Sprint 2 — Kaan'ın 1.4.4 (bilet tipi) eklemesi analiz edildi (temiz, kritik bulgu yok), Berke'nin kendi Sprint 2 görevi **1.3.5 (Otomatik kategorizasyon ve arşiv, REQ-05)** planına sadık şekilde tamamlandı.
**Branch:** `berke` (origin/berke'nin ilerisinde; **push işlemi yapılmadı**, manuel push kullanıcıya ait)

**Taze doğrulama (en son, tüm ekip kodu dahil — Sprint 1 + Sprint 2/Kaan + Sprint 2/Berke):**
- `npm run test:run` → `Test Files 14 passed (14)` / `Tests 100 passed (100)`, exit 0
- `npm run lint` → **0 hata, 0 uyarı**, exit 0
- `npm run build` → başarılı, exit 0
- `npm audit` → **0 zafiyet** (transitive `brace-expansion` DoS uyarısı `npm audit fix` ile temizlendi, testler tekrar doğrulandı)
- Case-sensitivity: `git ls-files` + özel bir script ile **tüm** relative import'ların gerçek dosya case'iyle birebir eştiği doğrulandı (Linux'ta build'i kıran tek noktaydı, artık kapalı)

---

## Sprint 2 — Kaan'ın Eklemesi Analizi + Berke'nin Görevi (1.3.5)

### Kaan'ın Sprint 2 eklemesi (1.4.4 — Sepet + bilet tipi seçimi, REQ-02) — analiz sonucu

**Verdict: Temiz, kritik/yüksek/orta seviye bulgu yok.** İncelenen dosyalar: `domain/ticketType.js` (yeni), `context/cartReducer.js`, `pages/BookingPage.jsx`, `pages/CartPage.jsx`, `services/reservationService.js` + tüm ilgili testler.

- Mimari sağlam: kendi Sprint 1 çalışmasındaki (`domain/seatStatus.js`) desenin aynısı `domain/ticketType.js`'te tekrarlanmış (sabit değerler + doğrulama + Türkçe etiket ayrımı) — tutarlı.
- Sepet koltukları `string[]`'ten `{seatId, ticketType}[]`'e geçti; bu dönüşüm `reservationService.js`'te **sınırda** (`getSeatIdsFromCartSeats`) yapılıyor, `seatService`'e hâlâ düz `seatId` listesi gidiyor — iyi katmanlama.
- **Benim Sprint 1 düzeltmem (K3 — `AdminDashboard.jsx`'in gerçek rezervasyon verisinden istatistik hesaplaması) bu değişiklikten etkilenmemiş** — `item.seats.length` hem string hem obje dizisinde aynı çalışıyor, doğrudan kontrol ettim.
- `SuccessPage.jsx` `.seats`'e hiç dokunmuyor, etkilenmemiş.
- Testler gerçek davranışı kontrol ediyor (tautolojik değil): dedupe, merge, geçersiz tip reddi, `[object Object]` render riski önlenmiş.
- **Tek düşük seviye not (Kaan'ın kendi STATUS'unda da işaretlemiş):** commit'e ilgisiz bir `docs/omer_STATUS.md` eklenmiş — zararsız, sadece kapsam dışı.
- Ayrı, Kaan'la ilgisiz bir housekeeping: `npm audit`'in bulduğu transitive `brace-expansion` (DoS) zafiyeti `npm audit fix` ile temizlendi, testler tekrar 100/100 doğrulandı.

### ✅ 1.3.5 — Otomatik kategorizasyon ve arşiv (REQ-05)

**Durum:** Tamamlandı, PLAN.md'nin dosya kapsamına sadık kalındı (`movieService.js`, `HomePage.jsx`).

**Ne yapıldı:**
- `movieService.js`'e `isMovieArchived(movie, referenceDate)` eklendi — `screeningEndDate` alanı geçmişteyse (bugün hariç) film arşivlenmiş sayılır. Alan yoksa hiçbir zaman arşivlenmez (mevcut `isMovieReleased`'daki güvenli varsayılan deseniyle birebir tutarlı).
- `HomePage.jsx`: `movies` listesi artık önce `isMovieArchived` ile elenip (`activeMovies`), Vizyonda/Yakında ayrımı bu filtrelenmiş küme üzerinden yapılıyor — arşivlenmiş bir film **hiçbir sekmede** görünmüyor.
- `data/movies.js`'e demoyu gösterilebilir kılmak için 1 örnek arşivlenmiş film eklendi (id 7, "Son Tren", `releaseDate` ve `screeningEndDate` ikisi de geçmişte) — Sprint 1'de "Yakında" sekmesi için yaptığım aynı gerekçeyle (kabul kriterinin gerçekten test edilebilir/gösterilebilir olması).
- **Veri silinmiyor:** `movieService.getMovieById` hiç değiştirilmedi, arşivlenmiş film hâlâ id ile erişilebilir — testle doğrulandı.

**Testler (yeni, 6 test):**
- `movieService.test.js` — `isMovieArchived`'ın 4 sınır durumu (geçmiş/tam bugün/gelecek/alan yok) + "arşivlenmiş film hâlâ `getMovieById` ile erişilebilir" regresyon testi.
- `HomePage.test.jsx` — arşivlenmiş filmin ne Vizyonda ne Yakında sekmesinde göründüğünü doğrulayan entegrasyon testi.

**Kalite kontrolleri:** `npm run test:run` → 14 dosya / 100 test ✅ · `npm run lint` → 0 hata ✅ · `npm run build` → başarılı ✅.

**Bilinçli, açıklanan scope kararı:** `AdminMovieForm.jsx`'e `screeningEndDate` alanı eklenmedi — bu, 1.5.2'nin (admin form) dosya kapsamı, 1.3.5'in değil (tıpkı Sprint 1'de `releaseDate` için yaşanan Y2 boşluğu gibi). Admin panelinden eklenen filmler bu yüzden şimdilik asla otomatik arşivlenmeyecek (güvenli varsayılan, hata değil) — ileride admin formu güncellenirken bu alan da eklenmeli.

**Teknik borç temizliği (ayrı, küçük):** Kök dizindeki gereksiz `tatus` dosyası (Sprint 1'den beri `PLAN.md`'de not edilen teknik borç) silindi.

---

## Sprint 1 — Ekip Geneli Review + Düzeltme Turu

Kullanıcı talebiyle: (1) tüm STATUS dosyaları incelendi, (2) 4 branch'in (`berke`/`kaan`/`omer`/`Alp`, hepsi `main`'e merge edilmiş) birleşik hali analiz edildi, (3) her alan için (Auth/Ömer, Koltuk state machine/Kaan, Admin+Lokasyon/Alptuğ, Katalog/ben) derinlemesine code review yapıldı, (4) bulunanlar `docs/SPRINT1_REVIEW.md`'ye yazıldı, (5) kullanıcı onayıyla bulunan hata ve eksikliklerin büyük kısmı bu branch'te düzeltildi.

**Bulunan ve düzeltilen kritik/yüksek öncelikli sorunlar** (tam liste ve gerekçeler `docs/SPRINT1_REVIEW.md`'de):

| # | Sorun | Düzeltme |
|---|---|---|
| K1 | Admin dosyaları yanlış case ile import edilmiş — Windows'ta sorunsuz, **Linux'ta (her gerçek deploy ortamı) build çöküyor** | `git mv` ile dosya/klasör case'i import'larla eşleştirildi; repo genelinde başka mismatch olmadığı ayrı bir script ile doğrulandı |
| K2 | `/admin` hiçbir auth/rol kontrolü olmadan herkese açıktı | `src/components/routing/ProtectedRoute.jsx` eklendi, `/admin` rotaları `allowedRoles={["admin"]}` ile sarıldı, 3 yeni testle doğrulandı |
| K3 | Admin istatistik paneli tamamen sahte (hardcoded) veri gösteriyordu; `WBS_GOREV_DAGILIMI.md` bunun gerçek hesaplama olduğunu (yanlışlıkla) iddia ediyordu | `reservationService.getAllReservations()` eklendi, dashboard artık gerçek rezervasyonlardan film bazlı istatistik hesaplıyor |
| Y1 | Admin film tablosunda (benim posteri olmayan "Yakında" filmlerim için) kırık resim ikonu çıkıyordu | `<img>` yerine var olan `MoviePoster` bileşeni kullanıldı |
| Y2 | Admin film formunda `releaseDate` alanı yoktu → admin panelinden asla "Yakında" film eklenemiyordu (benim Sprint 1 özelliğimle doğrudan çatışan bir boşluk) | Forma "Vizyon Tarihi" alanı eklendi |
| Y4 | Lint 13 hatayla kırıktı (gereksiz `React` import'ları, fonksiyon-önce-kullanım, sessizce yutulan `catch` hataları, bir gerçek `react-hooks/set-state-in-effect` ihlali) | Tüm dosyalar temizlendi; `AdminMoviesPage.jsx` projedeki diğer sayfalarla tutarlı olması için `useQuery`'e taşındı |
| Y5 | Konum izni reddedilince ekrandaki mesaj ("tüm sinemalar listeleniyor") ile gerçek davranış (sadece İstanbul'a filtreleniyordu) çelişiyordu | Mesaj ve davranış birbirine uyduruldu |
| O2 | Admin formu `duration`/`releaseYear`'ı sayı yerine string olarak saklıyordu | `handleChange`'de sayısal alanlar `Number()` ile çevriliyor |
| O3 | Header'da `/login` `/register` `/profile` linkleri var ama route'ları yok, tıklayınca tamamen boş sayfa çıkıyordu | `NotFoundPage.jsx` + wildcard (`*`) rota eklendi |

**Bilinçli olarak düzeltilmeyen (ve nedeni):**
- **Y3 — Koltuk kilidi (`GECICI_KILITLI`) çakışma kontrolü eksik:** `reserveSeats`, bir koltuğun başka birinin kilidi altında olup olmadığına bakmıyor. Doğru çözüm bir "kilit sahibi/token" kavramı gerektiriyor; bunu şimdiden tahminle eklemek, Kaan'ın zaten test ettiği (`seatService.test.js:139`) meşru `GECICI_KILITLI→DOLU` davranışını bozma riski taşıyordu ve 1.4.7'nin (henüz yazılmamış) UI akışı olmadan doğru tasarımı tahmin etmek riskliydi. Kod içine ayrıntılı bir uyarı notu bırakıldı, karar 1.4.7'yi alacak kişiye (muhtemelen Kaan) bırakıldı.
- **O1 — Sinema kartındaki "Seansları Gör" butonu işlevsiz:** Düzeltmek, sinema↔seans veri ilişkisini modellemeyi gerektirir — bu bir "fix" değil yeni bir özellik kapsamı.
- **O4 — Session 101'deki demo koltuk kilidi hiç açılmıyor:** Kaan'ın kod yorumu bunun 4 durumu bir arada göstermek için kasıtlı demo verisi olduğunu açıkça belirtiyor; gerçek bir hata değil.
- **O5 — Çoklu seanslı sepette kısmi rezervasyon hatası:** Backend olmadan tam atomiklik sağlanamaz, review'ın ötesinde bir kapsam.
- **Alptuğ için STATUS dosyası eksik / PLAN.md'nin yeniden dengelenmesi:** Bu ikisi başka birinin/ekibin kararı, tek taraflı yapılmadı.

Tüm liste, gerekçeler ve "Sprint 2 öncesi yapılacaklar" `docs/SPRINT1_REVIEW.md`'de güncel çözüm durumuyla işaretli.

---

## Sprint 1 — İzzettin Berke Kuş

### ✅ 1.3.1 — Vizyonda / Yakında sekme yapısı (REQ-08)

**Durum:** Tamamlandı, kendi kendine code review yapıldı, testler+lint+build geçiyor.

**Ne yapıldı:**
- Ana sayfaya (`HomePage.jsx`) "Vizyonda" ve "Yakında" sekmeleri eklendi. Sekme geçişi tamamen client-side state (`useState`), **sayfa yenilenmeden** ve **ekstra ağ isteği olmadan** çalışıyor (tek `useQuery(["movies"])` çağrısı, sekmeler sadece sonucu filtreliyor).
- `movieService.js`'e üç saf (pure) yardımcı fonksiyon eklendi: `isMovieReleased`, `getDaysUntilRelease`, `parseIsoDateOnly`. Zaman dilimi (timezone) hatalarına karşı ISO tarihler `new Date(isoString)` yerine yıl/ay/gün bileşenlerinden manuel kuruluyor.
- `data/movies.js`'teki 4 mevcut filme `releaseDate: "2026-07-13"` eklendi (mevcut seans tarihleriyle tutarlı — hepsi zaten vizyonda). "Yakında" sekmesinin boş kalmaması için 2 yeni film eklendi (`Kayıp Sinyal` – 2026-08-14, `Sessiz Ev` – 2026-10-02), posterleri yok — bu durum zaten var olan `MoviePoster` fallback tasarımıyla (poster bulunamadı görünümü) otomatik karşılanıyor, yeni bir tasarım eklenmedi.
- `MovieCard.jsx`: "Yakında" filmlerinde footer'da (**var olan `.movie-card-footer` sınıfı yeniden kullanılarak**, yeni CSS eklenmeden) vizyon tarihi + kalan gün metni ("Vizyona N gün kaldı" / "Yarın vizyonda" / "Bugün vizyonda") gösteriliyor.
- `App.css`'e sadece **ekleme** olarak (mevcut hiçbir kural değiştirilmeden, dosya sonuna eklenerek) sekme bileşeni için minimal CSS eklendi — mevcut renk tokenlarını (`var(--color-*)`) kullanıyor.

**Testler (yeni, 12 test, hepsi geçiyor):**
- `src/services/movieService.test.js` — tarih sınır durumları (tam bugün, geçmiş, gelecek, `releaseDate` eksik).
- `src/pages/HomePage.test.jsx` — varsayılan sekme, sekme geçişinde doğru filmler + kalan gün metni, sekme değişince **tekrar fetch atılmadığının** doğrulanması, boş durum mesajı.

**Kalite kontrolleri (hepsi yerel olarak çalıştırıldı):**
| Kontrol | Sonuç |
|---|---|
| `npm run test:run` | ✅ 7 dosya / 24 test geçti (21 mevcut + 3 yeni HomePage + değişmeyen movieService eklentisi) |
| `npm run lint` | ✅ hata yok |
| `npm run build` | ✅ başarılı |
| Görsel/tarayıcı kontrolü | ⚠️ **Yapılamadı** — bu ortamda tarayıcı otomasyon aracı yok. Doğrulama `vitest` + `@testing-library/react` ile gerçek DOM (jsdom) üzerinden yapıldı (gerçek render, gerçek click event'leri, gerçek CSS class kontrolü) ama bu, gerçek tarayıcıda görsel kontrolün yerini tutmaz. **Öneri:** Berke ya da bir teammate `npm run dev` ile sayfayı bir kez tarayıcıda gözden geçirsin. |

**Kendi kendine code review bulguları (8 açıdan, ~15 aday, verify sonrası):**

| # | Bulgu | Karar |
|---|---|---|
| 1 | `MovieCard.jsx`'te iki neredeyse aynı `.movie-card-footer` div'i (ternary) | ✅ **Düzeltildi** — tek wrapper div'e indirildi, sadece iç içerik koşullu. |
| 2 | `parseIsoDateOnly` UTC/local timezone off-by-one riski | ✅ **Düzeltildi (review öncesi, geliştirme sırasında yakalandı)** — ISO string manuel Y/M/D ile parse ediliyor, `new Date(isoString)` kullanılmıyor. |
| 3 | `MovieCard`'ın kendi `isMovieReleased` hesaplaması `HomePage`'in sekme bucketing'iyle "iki kaynak" riski taşıyor mu? | 🟡 **Bilinçli olarak değiştirilmedi** — pure fonksiyon, aynı anda/aynı veri üzerinde çağrılıyor, sonuç her zaman tutarlı; prop olarak geçirmek `MovieList.jsx`'i de scope'a katardı ve kartın kendi kendine yeten (self-contained) tasarımını bozardı. |
| 4 | `movieService.js`'e senkron yardımcı fonksiyonlar eklendi ama dosya asıl async servis katmanı | 🟡 **Bilinçli, PLAN.md ile tutarlı** — `docs/PLAN.md`'de Sprint 2 (1.3.5) ve Sprint 3 (1.3.6) zaten aynı dosyayı (`movieService.js`) genişletecek şekilde planlanmış; bu görevler bu mantığın doğal ev sahibinin burası olduğunu zaten öngörmüş. |
| 5 | 1.3.1'in PLAN.md'deki dosya listesi sadece `HomePage.jsx`, `movies.js`, `MovieCard.jsx` — ama `movieService.js` de değişti | 🟡 **Şeffaf bilgilendirme** — tarih/durum mantığının iki UI dosyasında (HomePage + MovieCard) kopyalanmasını önlemek için servis katmanına eklendi; bu, mimariyle tutarlı ve PLAN.md'nin kendisinin öngördüğü bir yön. Scope dışı bir özellik eklenmedi, sadece paylaşılan mantığın doğru katmanda durması sağlandı. |
| 6 | `MovieDetailsPage.jsx` / `SessionList.jsx`, "Yakında" bir filmin detayına gidildiğinde (film id 5/6) sadece genel "seans yok" mesajı gösteriyor, vizyon tarihi bağlamı yok | ⏭️ **Bilinçli olarak ertelendi** — 1.3.1'in dosya kapsamı dışında (`MovieDetailsPage.jsx` listede yok); ileride 1.3.6 veya ayrı bir görevle ele alınmalı. Çökme veya hatalı davranış yok, sadece geliştirilebilir bir UX detayı. |
| 7 | Yeni CSS'te `#211a0b` ham hex kodu, PLAN.md'nin "sadece token kullan" kuralına aykırı görünüyor | 🟡 **İncelendi, sorun değil** — bu hex kod (`var(--color-yellow)` üzerinde koyu metin için) `App.css`'te zaten 3 yerde aynı şekilde kullanılıyordu (satır 168, 802, 988); yeni bir sapma değil, mevcut kod stiliyle tutarlı, "mevcut tasarımı değiştirme" talimatına uygun. |
| 8 | `formatDaysRemainingLabel`'daki `daysRemaining <= 0` dalı bugünkü tek çağrı noktasında hiç tetiklenmiyor (ulaşılamaz) | 🟡 **Değiştirilmedi** — zararsız, savunmacı programlama; fonksiyonun genel sözleşmesini eksiksiz tutuyor. |

**Bilinçli, dokümante edilmiş scope kararları (özet):**
- `movieService.js` PLAN.md'nin 1.3.1 dosya listesinde yok ama dokunuldu (yukarıda madde 4-5, gerekçeli).
- `data/movies.js`'e 2 yeni "yakında" filmi eklendi (poster olmadan, mevcut fallback tasarımla) — "Yakında" sekmesinin gerçekten test edilebilir/gösterilebilir olması için gerekliydi.
- Hiçbir yeni sayfa, admin özelliği, kampanya, favori vb. **eklenmedi** — sadece REQ-08'in kapsamı.

---

## Genel Notlar

- **Push/Pull yapılmadı** — talimat gereği tüm değişiklikler yerel `berke` branch'inde, kullanıcı manuel push edecek.
- `origin/kaan` ve `origin/Alp` branch'leri kontrol edildi: şu ana kadar kaynak kod çakışması yok (Kaan sadece README+PLAN.md dokunmuş, Alp'te henüz commit yok).
- `npm install` bu oturumda çalıştırıldı (bağımlılıklar kurulu değildi); `package-lock.json`'daki ilgisiz npm-metadata farkı geri alındı, diff sadece 1.3.1 kapsamındaki dosyalarla sınırlı.

## Sırada Ne Var

Sprint 1'in 4 görevi tamamlandı. Sprint 2'de şu ana kadar Kaan'ın 1.4.4'ü (analiz edildi, temiz) ve Berke'nin 1.3.5'i (bu oturumda tamamlandı) bitti. Sprint 2'nin geri kalanı — Ömer'in 1.2.1'i (Login/register) ve Alptuğ'un 1.5.8'i (zaten Sprint 1'de bitmişti, PLAN.md'nin yeniden dengelenmesi gerekiyor) — henüz yapılmadı; `docs/WBS_GOREV_DAGILIMI.md` §2'de kişi bazlı güncel kalan görev listesi var. Berke'nin bir sonraki kendi görevi **Sprint 3 / 1.3.3 — Sıralama modülü (tarih ve puan)**, PLAN.md'ye göre.
