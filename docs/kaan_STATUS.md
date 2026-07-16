# Kaan — Durum Raporu

**Görev:** 1.4.3 — Koltuk state makinesi: 4 durum (REQ-01)
**Sprint:** Sprint 1
**Durum:** ✅ Tamamlandı (kod incelemesine hazır)
**Branch:** `kaan`

---

## 1. Ne yapıldı

Koltuk durumu artık dört net durumla modelleniyor: `BOS`, `SECILI`, `GECICI_KILITLI`, `DOLU`.
Tüm geçişler REQ-01'de tanımlanan tabloya göre tek bir yerden (`src/domain/seatStatus.js`)
kontrol ediliyor; component'lerde veya serviste dağınık `if/else` ile durum kontrolü yok.

### REQ-01 geçiş tablosu (uygulanan)

| Kaynak durum | Hedef durum | Neden |
|---|---|---|
| `BOS` | `SECILI` | kullanıcı koltuğu seçer |
| `SECILI` | `BOS` | kullanıcı seçimini kaldırır (henüz onaylanmamış) |
| `SECILI` | `GECICI_KILITLI` | kilit oluşturulur (1.4.7 bunun üzerine kurulacak) |
| `GECICI_KILITLI` | `DOLU` | rezervasyon/ödeme tamamlanır |
| `GECICI_KILITLI` | `BOS` | REQ-19 zaman aşımı / REQ-12 kullanıcı iptali / REQ-13 sayaç bitimi |
| `DOLU` | `BOS` | rezervasyon iptali |

Bunların dışındaki her geçiş (örn. `BOS→DOLU`, `DOLU→SECILI`, `GECICI_KILITLI→SECILI`)
reddedilir.

## 2. Değişen dosyalar

| Dosya | Ne değişti |
|---|---|
| `src/domain/seatStatus.js` **(yeni)** | Tek doğruluk kaynağı: 4 durum sabiti, REQ-01 geçiş tablosu, `isSeatSelectable`, `resolveDisplaySeatStatus` (öncelik kuralları), Türkçe etiketler |
| `src/services/seatService.js` | Güvensiz `JSON.parse` düzeltildi (artık `try/catch` + şema doğrulama var); `getReservedSeatsBySessionId` geriye dönük uyumlu bırakıldı; yeni `getSeatStatusesBySessionId`, `lockSeats`, `releaseLockedSeats`, `cancelReservedSeats` eklendi; `reserveSeats` çakışma kontrolü korunarak genişletildi |
| `src/services/errors.js` | `ConflictError` (409) eklendi |
| `src/components/seats/Seat.jsx` | Artık tek bir `status` prop'una göre render ediyor (booleans yerine); 4 durum için ayrı `aria-label`/`title`/class; `GECICI_KILITLI` ve `DOLU` her zaman `disabled` |
| `src/components/seats/SeatMap.jsx` | Her koltuğun görüntülenecek durumunu `resolveDisplaySeatStatus` ile hesaplıyor; 4 durumlu legend (gösterge) eklendi; layout/key mantığı değişmedi |
| `src/pages/BookingPage.jsx` | `getSeatStatusesBySessionId` kullanıyor; yenilenen veri bir koltuğu `GECICI_KILITLI`/`DOLU` yaparsa seçimden otomatik çıkarılıyor (diğer geçerli seçimler korunuyor); sepete eklemeden önce son bir müsaitlik kontrolü var |
| `src/App.css` | 4 durum için ayrı ve birbirinden görsel olarak ayrışan stiller (renk + desen, sadece renk değil); klavye odağı (`:focus-visible`) eklendi |

**Ekstra düzeltme:** `src/components/seats/` altında yanlış küçük harfli bir `seat.jsx`
kopyası (önceki bir casing düzeltmesinden kalan artık) fark edildi ve temizlendi;
kullanılan tek dosya doğru şekilde `Seat.jsx`.

## 3. Testler

Yeni/güncellenen test dosyaları — **58 test, 9 dosya, tamamı geçiyor**:

- `src/domain/seatStatus.test.js` — geçiş tablosu, durum önceliği, geçersiz girdi
- `src/services/seatService.test.js` — bozuk/eksik/şema dışı storage verisi, kilit/rezervasyon geçişleri, çakışma kontrolü
- `src/components/seats/Seat.test.jsx` — 4 durumun render/erişilebilirlik/tıklama davranışı
- `src/components/seats/SeatMap.test.jsx` — layout, benzersiz koltuk id'leri, legend
- `src/pages/BookingPage.test.jsx` — seçim/seçim kaldırma, kilitli/dolu koltuk engeli, yenilenen veriyle uzlaştırma (reconciliation)

## 4. Doğrulama (bu makinede çalıştırıldı)

```
npm run lint      -> temiz (0 hata)
npm run test:run  -> 9 dosya / 58 test PASS
npm run build     -> başarılı
```

Ayrıca tarayıcıda manuel olarak: 101 numaralı seansta 4 durumun hepsi bir arada
görüntülendi, koltuk seçimi/seçim kaldırma, kilitli/dolu koltuğa tıklama engeli,
sepete ekleme ve rezervasyon tamamlama sonrası koltuğun `DOLU`'ya dönmesi kontrol edildi.

## 5. Bilinerek bırakılan ara durum (sonraki task için not)

Koltuk kilitleme (`GECICI_KILITLI`) servis katmanında tam olarak var (`lockSeats` /
`releaseLockedSeats`), ama **henüz booking akışına bağlanmadı** — çünkü ödeme/sayaç
ekranı (1.4.7 / 1.4.8) henüz yok ve sepetten çıkarma akışına dokunmadan kilidi güvenle
geri açacak bir yer yok. **1.4.7'yi alacak kişi** bu iki fonksiyonu ödeme ekranına
girişte/çıkışında çağırarak kullanabilir; state modeli buna hazır.

## 6. Kapsam dışı bırakılanlar

- Backend/veritabanı yok (Faz-1 kapsamı).
- 1.4.7'nin sayaç/geri sayım UI'ı yapılmadı (yalnızca servis altyapısı hazır).
- `CartPage.jsx`, `cartReducer.js`, `reservationService.js` davranışsal olarak
  değiştirilmedi (geriye dönük uyumluluk korunduğu için gerek kalmadı).
- Yeni bağımlılık eklenmedi.

---

# Güncelleme — 16 Temmuz 2026: Sprint 2 / 1.4.4 (REQ-02)

**Görev:** 1.4.4 — Sepet yapısı + bilet tipi seçimi (REQ-02)  
**Sprint:** Sprint 2  
**Durum:** ✅ Tamamlandı (kod incelemesi ve doğrulama yapıldı)  
**Branch:** `kaan`  
**İncelenen commit:** `22ced6e` — *Bilet tipleri eklendi*  
**Baseline:** `38166e5` (Sprint 1 koltuk state makinesi) → `22ced6e`  
**Not:** Working tree temiz; sonraki `d943775` (main merge) bu incelemenin parçası değildir.

> 1.4.3 kaydı yukarıda tarihsel olarak korunmuştur. Aşağıdaki giriş, 1.4.4 sonrası
> güncel durumu tanımlar; özellikle `CartPage.jsx` / `cartReducer.js` /
> `reservationService.js` artık bu görev kapsamında değiştirilmiştir
> (1.4.3 §6’daki “değiştirilmedi” ifadesi yalnızca o sprint anını yansıtır).

## 1. Ne yapıldı (REQ-02)

- Sepet koltukları artık `{ seatId, ticketType }` nesneleri; seans bazlı gruplama korundu.
- Makine değerleri: `ADULT` / `STUDENT` / `CHILD` → Yetişkin / Öğrenci / Çocuk
  (`src/domain/ticketType.js`). Belgelerde varsayılan yoktu → varsayılan `ADULT`.
- Aynı seansta farklı tipler bir arada; `UPDATE_TICKET_TYPE` tek koltuğu günceller.
- Yinelenen `(sessionId, seatId)` `seatId` ile engellenir (`Map`; `Set(object)` yok).
- BookingPage: seçime bağlı tip seçici; deselect / `GECICI_KILITLI`/`DOLU` uzlaştırması
  hem seçimi hem tip verisini temizler; REQ-01 state makinesi bozulmadı.
- CartPage: sepette tip görüntüleme/değiştirme; sayaç ve toplam hâlâ
  `seats.length * unitPrice` (çarpanlar **1.4.5** kapsamı, bu görevde yok).
- `reservationService`: `seatService`’e düz `seatId` listesi; rezervasyon kaydında tip korunur.
- UI iyileştirmesi: koyu tema select (`color-scheme: dark`, özel ok, okunabilir option),
  iki sütunlu satır düzeni, mobil yığılma, `visually-hidden` ile erişilebilir ad
  (`{seatId} koltuğu` + gizli `bilet tipi`).

## 2. Değişen dosyalar (22ced6e)

| Dosya | Ne değişti |
|---|---|
| `src/domain/ticketType.js` **(yeni)** | Tip sabitleri, etiketler, doğrulama, varsayılan |
| `src/domain/ticketType.test.js` **(yeni)** | Domain birim testleri |
| `src/context/cartReducer.js` | Nesne koltuklar, merge/dedupe, `UPDATE_TICKET_TYPE`, geçersiz tip reddi |
| `src/context/cartReducer.test.js` | Yeni yapı ve immutability senaryoları |
| `src/pages/BookingPage.jsx` | Per-seat tip seçimi + sepete `{ seatId, ticketType }` |
| `src/pages/BookingPage.test.jsx` | Tip UI / sepet payload / uzlaştırma testleri |
| `src/pages/CartPage.jsx` | Per-seat tip düzenleme; `seatId` metin gösterimi |
| `src/pages/CartPage.test.jsx` **(yeni)** | Tip değişimi, sayım, checkout payload |
| `src/services/reservationService.js` | Ticket → seatId dönüşümü; tipin rezervasyonda saklanması |
| `src/services/reservationService.test.js` | Nesne seats + string reserved-seats doğrulaması |
| `src/App.css` | Ticket-type satır/select stilleri (koyu tema) |
| `src/index.css` | `.visually-hidden` yardımcısı |

Ayrıca aynı commit’te `docs/omer_STATUS.md` eklendi — REQ-02 işlevselliğine ait değil
(inceleme bulgusu: Low; aşağıya bakın).

## 3. Testler (1.4.4 ile)

Odak testler: reducer nesne seats / çoklu tip / dedupe / update / invalid;
BookingPage tip atama ve orphan temizliği; CartPage bağımsız tip değişimi;
reservation düz seatId + tip korunumu; `[object Object]` UI gösterimi engeli.

## 4. Doğrulama (16 Temmuz 2026 — inceleme sonrası)

```
git diff --check 22ced6e^..22ced6e  -> temiz (exit 0)
npx eslint [1.4.4 kaynak/test dosyaları] -> temiz (0 hata)
npm run test:run  -> 13 dosya / 91 test PASS
npm run build     -> başarılı
```

**Lint notu:** Çalışma anındaki tam `npm run lint` Admin/Cinemas dosyalarında hata
veriyor; bu dosyalar `22ced6e` içinde değil, sonraki `main` merge (`d943775`) ile
gelmiştir. 1.4.4 diff’ine ait dosyalarda eslint temizdir.

## 5. Kod incelemesi sonucu (yalnızca 22ced6e)

**Kritik / Yüksek / Orta:** Yok — REQ-02 kabul kriterlerini geçersiz kılan bulgu yok.

**Low**
- `docs/omer_STATUS.md` bu commit’e REQ-02 ile birlikte eklenmiş (ilgisiz kapsam).

**Doğrulama sınırlaması**
- Native `<select>` açılır listesinin OS/tarayıcıya göre görünümü bu ortamda
  uçtan uca tarayıcı oturumuyla yeniden doğrulanmadı; kapalı durum stilleri ve
  `color-scheme: dark` / `option` stilleri diff’te mevcut.

## 6. Kapsam dışı (1.4.4)

- Bilet tipi fiyat çarpanları / `calcSubtotal` → **1.4.5**
- Öğrenci/çocuk kimlik doğrulama, gerçek backend, ödeme/sayaç (1.4.7+)
- Yeni bağımlılık eklenmedi.
