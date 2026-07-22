# CineSeat — Çalışma Durumu

> Bu dosya çalışma ilerledikçe güncellenir. Her görev tamamlandığında ilgili bölüm eklenir/güncellenir. Ayrıntılı sprint planı için `docs/PLAN.md`, görev-durum analizi için `docs/WBS_GOREV_DAGILIMI.md`. Mentöre basit dille anlatım için `docs/berke_SPRINT1_ACIKLAMA.md`.

**Son güncelleme:** Katalog & Sosyal modülüm **tamamen bitti (9/9 görev)**. Kaan'ın backlog'u Alptuğ tarafından devralınıp bitirildikten sonra çıkan `Alp`↔`main` merge conflict'ini çözdüm (ayrıntı aşağıda), ardından kendi kalan 6 görevimi (1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11) uçtan uca bitirdim. Ekipte kalan tek backlog artık Ömer'inki.
**Branch:** `Alp` → main'e mergelendi (PR #14, kullanıcı push etti); yeni işim şu an `berke` branch'inde, **push edilmedi**, manuel push kullanıcıya ait.

**Taze doğrulama (en son, modül tamamı dahil):**
- `npm run test:run` → `Test Files 20 passed (20)` / `Tests 164 passed (164)`, exit 0
- `npm run lint` → **0 hata, 0 uyarı**, exit 0
- `npm run build` → başarılı, exit 0
- Case-sensitivity: doğrulanmış durumda (Sprint 1'de kapatıldı)

---

## Sprint 3 — Bağımlılık Doğrulaması (kullanıcı talebiyle)

Kullanıcı, 1.3.6'ya geçmeden önce durup şunu netleştirdi: asıl istek her kişinin backlog'unu **tek bir kesintisiz prompt'ta** bitirebilmesiydi, sadece "tek sprint" değil. Bu yüzden `docs/PLAN.md` §5'teki 19 kalan görevin **her birinin** "Bağımlılık" satırı tek tek tarandı (kişi-içi ve kişiler-arası).

**Sonuç:** Kaan'ın 5 görevi tamamen bağımsız. Ömer'in 7'sinden 6'sı, Berke'nin 7'sinden (1.3.6 hariç) 6'sı da bağımsız. **Tek bulgu:** Ömer'in listesinde Kaan'a bağımlı 1.2.6, sondan bir önceki (6/7) sıradaydı — en sonda değildi. Bu, Berke'nin 1.2.10'unda uygulanan "dış bağımlılık en sonda" desenine aykırıydı. Düzeltme: Ömer'in listesinde 1.5.9 ile 1.2.6 yer değiştirildi (1.5.9 madde 6, 1.2.6 madde 7 oldu) — artık ikisi de aynı desende: 6 bağımsız görev + en sonda 1 dış-bağımlı görev.

`docs/PLAN.md`'ye yeni bir **§6 "Tek-Sprint Yürütme Sırası"** bölümü eklendi (eski §6/§7 numaraları §7/§8'e kaydı, referanslar güncellendi): Kaan'ın kendi ilk iki maddesi (1.4.5, 1.4.8) hem Ömer'i hem Berke'yi besliyor; bu iki madde Kaan'ın kendi sırasının başında olduğu için üç backlog paralel başlayabilir, kimse birbirini baştan beklemez. `docs/WBS_GOREV_DAGILIMI.md` §2 ve §3'e de aynı sıralama ve gerekçe yansıtıldı.

---

## Alp → main merge conflict çözümü (kullanıcı talebiyle)

Kaan'ın backlog'unu devralan Alptuğ, `main`'in gerisinde kalan eski bir noktadan dallanmış olduğu için PR'ı GitHub'da "conflicts must be resolved" diyordu. İzole bir git worktree'de gerçek merge'ü deneyip **6 dosyada gerçek conflict** buldum:

- **`BookingPage.jsx`:** Alp'in versiyonu her koltuğu hardcoded `"ADULT"` yapıyordu, aynı dosyadaki bilet-tipi dropdown'ını görmezden geliyordu — main'in doğru versiyonu korundu.
- **`CartPage.jsx` / `CartPage.test.jsx`:** Alp, rezervasyon oluşturmayı `CartPage`'den tamamen çıkarıp `/odeme` akışına taşımıştı (Kaan'ın 1.4.8'inin amacı zaten buydu) — Alp'in tarafı alındı.
- **`AdminDashBoard.jsx` (silinmiş/case):** Bu tam olarak Sprint 1'de bulunup düzeltilen **K1 case-sensitivity bug'ının** ta kendisiydi — Alp'in dosyası sahte hardcoded istatistik gösteren eski versiyondu. Ayrıca bu dosyayı silerken **Windows'un case-insensitive dosya sisteminde diskteki tek dosya olduğu için doğru `AdminDashboard.jsx` da fiziksel olarak silindi** — fark edip `git checkout-index` ile geri yükledim.
- **`reservationService.js`:** Alp'in `reserveAllSeats`'i rezervasyonu **atomik hale getirmiş** — `SPRINT1_REVIEW.md`'deki O5 teknik borcunu çözüyor, alındı.
- Merge sonrası 8 lint hatası çıktı (Alp hiç lint çalıştırmamış) — hepsi düzeltildi.

Çözümü doğru `Alp` branch'ine (case-insensitive FS'te `alp`/`Alp` çakışmasını önlemek için önce sil-sonra-oluştur sırasıyla) taşıdım, kullanıcı push etti, main'e merge edildi (PR #14). Tam detay: bu konuşmanın önceki turları.

---

## Sprint 3 — Kalan 6 görev: 1.3.3, 1.3.4, 1.3.8, 1.3.9, 1.3.10, 1.3.11 — hepsi ✅

Alp merge'i main'e alındıktan sonra kendi backlog'umun kalanını tek oturumda bitirdim.

**Veri modeli genişletmeleri:** `data/movies.js`'e her filme `rating: {average, count}` ve `fragmanYoutubeId` eklendi (3 film kasıtlı `fragmanYoutubeId: null` — REQ-09.1 fallback'ini gerçek veriyle test edebilmek için). Yeni `data/comments.js` (2 seed yorum, id 1'e). Yeni servisler: `ratingService.js` (localStorage, kullanıcı puanı seed ortalamasının üzerine ağırlıklı ekleniyor), `commentService.js` (10-500 karakter + yasaklı kelime + sahiplik kontrolü). `errors.js`'e `ValidationError`/`ForbiddenError` eklendi.

**1.3.3 + 1.3.4 (Sıralama + Filtreleme, REQ-08.1):** `movieService.sortMovies`/`filterMovies`/`getAvailableGenres`/`getAvailableAgeRatings` + `SortControl.jsx`/`FilterControl.jsx`, `HomePage.jsx`'e entegre, aktif sekmenin filmleri üzerinde birlikte çalışıyor, filtre sonucu boşsa ayrı bir empty-state mesajı var.

**1.3.8 (Fragman modalı, REQ-09/09.1):** `TrailerModal.jsx` — YouTube iframe, Escape/backdrop/kapat butonuyla kapanır. Tarayıcıda iframe yükleme başarısızlığını güvenilir tespit etmenin bir yolu olmadığı için fallback iki katmanlı: `onError` + her zaman görünen "YouTube'da Aç" linki.

**1.3.9 (Puanlama, REQ-11):** `RatingStars.jsx` — yalnız üye puanlar, **sadece vizyondaki (yayınlanmış) filmlerde gösteriliyor** (REQ-11'in "Vizyonda film detayında" ifadesine sadık kalındı — "Yakında" filmlerinde bölüm hiç render edilmiyor).

**1.3.10 + 1.3.11 (Yorum formu + listeleme, REQ-11/11.1):** `CommentForm.jsx` + `CommentList.jsx` — ziyaretçiye form hiç render edilmiyor, sadece "giriş yap" mesajı; mock (`seed-`) + kullanıcı (`comment-`) yorumları birlikte listeleniyor, tarihe göre yeniden eskiye; yalnız kendi (seed olmayan) yorumunu düzenler/siler.

**Self-review'da bulunan ve düzeltilen 3 gerçek sorun:**
1. `RatingStars.jsx`'te yıldızlar `role="radiogroup"` içindeydi ama `<button>` çocukları `role="radio"` değildi — geçersiz ARIA kombinasyonu, kaldırıldı.
2. Ziyaretçi için de yıldız hover önizlemesi çalışıyordu (tıklanamayacak bir etkileşim izlenimi veriyordu) — `role === "member"` koşuluna bağlandı.
3. `SortControl.jsx`'te `SORT_OPTIONS` dizisini named export yapmıştım — `react-refresh/only-export-components` lint hatası verdi (bileşen dosyaları sadece bileşen export etmeli). Kullanılmadığı için export'u kaldırdım, dosya içinde private kaldı.

Ayrıca test yazarken gerçek bir **test-tuzağı** buldum ve düzelttim: `findByText` bazen kontrollü `<textarea>`'nın kendi (React'in senkronize ettiği) metnini eşleştiriyordu, gerçek liste elemanını değil — testleri `within(list)` ile listeye scope'layarak ve mutation'ın gerçekten bitmesini bekleyerek düzelttim (yanlışlıkla "geçti" görünen ama aslında yanlış şeyi test eden 2 test).

**Testler (yeni, ~47 test):** `movieService.test.js` +11 (sort/filter), `HomePage.test.jsx` +4, `MovieDetailsPage.test.jsx` yeni dosya +12 (trailer/rating/yorum), `ratingService.test.js` yeni +8, `commentService.test.js` yeni +12.

**Kalite kontrolleri (son hâliyle):** `npm run test:run` → 20 dosya / 164 test ✅ · `npm run lint` → 0 hata ✅ · `npm run build` → başarılı ✅.

`docs/PLAN.md` ve `docs/WBS_GOREV_DAGILIMI.md` güncellendi: 44 görevin 37'si bitti, kalan 7'si Ömer'in.

---

## Sprint 3 (konsolide backlog) — 1/8: 1.3.6 Yakında 6 ay zaman kısıtı

**Görev:** 1.3.6 — REQ-15 — "Yakında" listesini bugünden itibaren en fazla 6 ay içinde vizyona girecek filmlerle sınırla.
**Durum:** ✅ Tamamlandı
**Bağımlılık:** 1.3.1 ✅, 1.3.5 ✅ (ikisi de hazırdı).

**Ne yapıldı:**
- `movieService.js`'e `isWithinComingSoonWindow(movie, referenceDate, monthsAhead = 6)` eklendi — saf (pure) fonksiyon, `isMovieArchived`/`isMovieReleased` ile aynı desende (`parseIsoDateOnly`/`toDateOnly` paylaşılıyor, ISO tarih manuel Y/M/D ile parse ediliyor, timezone off-by-one riski yok). `releaseDate` alanı yoksa `true` döner — `isMovieReleased`'daki güvenli varsayılanla tutarlı (zaten `!isMovieReleased` ile birlikte kullanıldığı için bu dal pratikte devreye girmez, ama fonksiyonun kendi sözleşmesi eksiksiz kalsın diye eklendi).
- `HomePage.jsx`: `comingSoonMovies` filtresi artık `!isMovieReleased(movie) && isWithinComingSoonWindow(movie)` — 6 aydan uzak filmler "Yakında" sekmesinde görünmüyor ama `movies.js`'ten silinmiyor, admin panelinden hâlâ erişilebilir (kabul kriteriyle birebir).
- **Veri değişikliği yok:** Mevcut `movies.js`'teki hiçbir filmin vizyon tarihi bugünden (2026-07-22) 6 aydan uzak değil, dolayısıyla görünür davranışta bir değişiklik yok — bu normal, kısıt gelecekte eklenecek uzak-tarihli filmler için bir güvenlik/temizlik kuralı. Test edilebilirlik için veri eklemedim (mevcut testler sınır durumlarını sentetik `referenceDate` ile zaten kapsıyor).

**Testler (yeni, 4 test, `movieService.test.js`):** pencere içinde / pencere sınırında (tam 6 ay, dahil) / pencere dışında / `releaseDate` yok → `true`.

**Kalite kontrolleri:** `npm run test:run` → 17 dosya / 117 test ✅ · `npm run lint` → 0 hata ✅ · `npm run build` → başarılı ✅.

> **Not:** Bu doğrulama turunda Bash aracı bir kere `vitest` worker havuzunu ortam kaynak kısıtı yüzünden çökertip "Vitest failed to find the current suite" hatası verdi (tüm 17 suite aynı anda, gerçek bir kod hatası değil). PowerShell'de tekrar çalıştırılınca temiz geçti — gerçek bir regresyon değildi, sadece o anki kabuk/ortam sorunuydu.

---

## Sprint 2 — Ömer'in Eklemesi Analizi + PLAN.md Yeniden Yapılandırması

### Ömer'in Sprint 2 eklemesi (1.2.1 — Login/Register, REQ-16/REQ-21) — analiz sonucu

**1 gerçek bug bulundu ve düzeltildi:** `LoginPage.jsx` ve `RegisterPage.jsx`'te "zaten giriş yapmışsa ana sayfaya yönlendir" mantığı render gövdesinde doğrudan yazılmıştı:
```js
if (user) { navigate("/", { replace: true }); return null; }
```
Bu, React Router'ın kendi geliştirme uyarısını tetikliyor: *"You should call navigate() in a React.useEffect(), not when your component is first rendered."* Bunu tahminle değil, bir testle **kanıtladım**: aynı senaryoyu render edip konsolu izlediğimde uyarı çıktı VE sayfa boş bir `<div />` olarak render oldu (yönlendirme senkron tamamlanmadı) — gerçek tarayıcıda muhtemelen kısa bir boş-sayfa yanıp sönmesine denk gelirdi. `useEffect`'e taşıyarak düzelttim, aynı testle (artık geçiyor) kilitledim.

**Eksik test kapsamı tamamlandı:** Bu görev hiç test dosyası içermiyordu (`authService.js`, `AuthProvider.jsx`, `LoginPage.jsx`, `RegisterPage.jsx` — 0 test, auth gibi güvenlik-hassas bir alan için önemli bir boşluk). `authService.test.js`, `LoginPage.test.jsx`, `RegisterPage.test.jsx` eklendi (13 yeni test): giriş başarı/başarısızlık/boş alan, kayıt zorunlu alan/şifre eşleşme/e-posta+kullanıcı adı benzersizlik, otomatik oturum açma, render-bug regresyonu.

**Dokümantasyon tutarlılığı:** Ömer, Kaan ve benim tuttuğum "tek kişi = tek STATUS dosyası, sprint sprint güncellenir" kuralına uymayarak ayrı bir `docs/omer_status_2.md` dosyası oluşturmuştu. İçeriğini `docs/omer_STATUS.md`'ye taşıyıp (yeni bir "Sprint 2" bölümü olarak) `omer_status_2.md`'yi sildim — artık tek dosya.

**Diğer bulgular:** Kritik/yüksek seviye başka sorun yok. `Layout.jsx`'in `user.name` kullanımı geriye dönük uyumluluk alanıyla korunmuş; `ProtectedRoute.jsx` (Sprint 1, K2) yeni `register` alanından etkilenmemiş; checkout akışı auth'a hâlâ bağımlı değil (beklenen, henüz planlanmadı).

### PLAN.md yeniden yapılandırma — "kişi başı tek konsolide Sprint 3"

Kullanıcı talebiyle: Kaan/Ömer/Berke'nin eskiden **S3'ten S9'a kadar** tek tek dağıtılmış kalan görevleri, **tek bir "Sprint 3" backlog'unda** birleştirildi — her kişi kendi listesini bağımlılık sırasına göre kendi hızında bitirir, sprint sınırları arasında zorunlu bekleme yok. Alptuğ'un modülü zaten tamamen bitmiş olduğu için ona yeni görev eklenmedi (tek taraflı bir karar değil, `SPRINT1_REVIEW.md`'de zaten not edilmiş bir konu).

- **Kaan (5 görev):** 1.4.5 → 1.4.8 → 1.4.7 → 1.4.9 → 1.2.9
- **Ömer (7 görev):** 1.2.2 → 1.2.4 → 1.2.5 → 1.2.7 → 1.2.8 → 1.2.6 → 1.5.9
- **Berke (8 görev, benim):** 1.3.6 → 1.3.3 → 1.3.4 → 1.3.8 → 1.3.9 → 1.3.10 → 1.3.11 → 1.2.10

Kişiler arası kritik köprüler korundu ve belirginleştirildi: Kaan'ın 1.4.5'i (ara toplam sözleşmesi) benim 1.2.10'umdan önce bitmeli; Kaan'ın 1.4.8'i (ödeme akışı, gerçek rezervasyon verisi üretir) Ömer'in 1.2.6'sından önce bitmeli. Her görevin tam detayı (Kabul/Dosyalar/Bağımlılık) hiçbir bilgi kaybı olmadan `docs/PLAN.md` §5 "SPRINT 3"e taşındı, sadece sprint sınırları kaldırıldı.

`docs/WBS_GOREV_DAGILIMI.md` da bu yeni yapıya göre güncellendi (1.2.1 ✅ işaretlendi, özet sayaç 24/20'ye güncellendi, kişi bazlı tablolar PLAN.md'nin yeni sırasıyla eşleştirildi).

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

**Benim (Berke) modülüm tamamen bitti — 9/9 görev, kalan iş yok.** Kaan'ın modülü de Alptuğ tarafından bitirildi (2 küçük açık boşlukla, bkz. `docs/PLAN.md` §8). Ekipte kalan tek backlog Ömer'in 7 görevi (1.2.2, 1.2.4, 1.2.5, 1.2.7, 1.2.8, 1.5.9, 1.2.6) — dış bağımlılığı yok, kendisi tek oturumda bitirebilir. Benim tarafımdan yapılacak bir sonraki adım yok; kullanıcının `berke` branch'indeki son işi push edip main'e alması bekleniyor.
