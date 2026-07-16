# CineSeat — Çalışma Durumu

> Bu dosya çalışma ilerledikçe güncellenir. Her görev tamamlandığında ilgili bölüm eklenir/güncellenir. Ayrıntılı sprint planı için `docs/PLAN.md`, görev-durum analizi için `docs/WBS_GOREV_DAGILIMI.md`. Mentöre basit dille anlatım için `docs/berke_SPRINT1_ACIKLAMA.md`.

**Son güncelleme:** Sprint 1 — tüm ekibin (Ömer, Kaan, Alptuğ, Berke) `main`'e merge edilmiş çıktısı için kapsamlı review yapıldı (`docs/SPRINT1_REVIEW.md`), bulunan hata/eksikliklerin çoğu bu branch'te düzeltildi.
**Branch:** `berke` (origin/berke'nin ilerisinde; **push işlemi yapılmadı**, manuel push kullanıcıya ait)

**Taze doğrulama (en son, tüm ekip kodu dahil):**
- `npm run test:run` → `Test Files 12 passed (12)` / `Tests 71 passed (71)`, exit 0
- `npm run lint` → **0 hata, 0 uyarı**, exit 0 (review anında 13 hata vardı, hepsi temizlendi)
- `npm run build` → başarılı, exit 0
- Case-sensitivity: `git ls-files` + özel bir script ile **tüm** relative import'ların gerçek dosya case'iyle birebir eştiği doğrulandı (Linux'ta build'i kıran tek noktaydı, artık kapalı)

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

Sprint 1'in 4 görevi de artık tamamlanmış durumda (Ömer/Kaan/Alptuğ/Berke) ve `docs/SPRINT1_REVIEW.md`'de bulunan kritik/yüksek öncelikli sorunların çoğu bu branch'te kapatıldı. Kalan açık maddeler (Y3, O1, Alptuğ'un STATUS'u, PLAN.md'nin yeniden dengelenmesi) ekiple konuşulmalı. Berke'nin bir sonraki kendi görevi **Sprint 2 / 1.3.5 — Otomatik kategorizasyon ve arşiv**, `movieService.js` + `HomePage.jsx` dosyalarında.
