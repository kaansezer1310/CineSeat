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
