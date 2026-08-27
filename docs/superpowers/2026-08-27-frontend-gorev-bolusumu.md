# Frontend UI Revizyonu — Görev Bölüşümü (Kişi A / Kişi B)

> **Tarih:** 2026-08-27
> **Kapsam:** Faz 1'den itibaren kalan fazların iki kişi arasında bağımsız bölüşümü.
> **İlgili belgeler:** [`docs/superpowers/specs/2026-08-27-frontend-ui-revizyonu-design.md`](specs/2026-08-27-frontend-ui-revizyonu-design.md) (genel tasarım spec'i, tüm fazların tanımı), [`docs/superpowers/plans/`](plans/) (her fazın uygulama planı)

## Neden bu bölüşüm

Faz 1 (Header/Footer kabuğu) her sayfanın içine oturduğu için önce bitmesi gereken tek fazdı. Kalan
fazlar (2-6) sayfa/özellik bazında birbirinden büyük ölçüde bağımsız, bu yüzden "birlikte" bir
senkron adım olmadan iki kişiye bölünebiliyor. Kişi A, Faz 1'i zaten (bu sohbette) tamamladığı için
onu kendi track'inin ilk parçası olarak üstlendi.

## Bölüşüm

| Kim | Fazlar | İçerik |
|---|---|---|
| **Kişi A** | **Faz 1 → Faz 2 → Faz 3** | Header/CitySelector/CartButton/UserMenu/ThemeToggle/MobileMenu/Footer/Layout kabuğu **(tamamlandı)** → Landing yeniden yazımı + `/movies` ayrımı + Rail bileşeni → MovieDetails → Booking → Cart → Payment → Success/Error (koltuk haritası, stepper, ödeme akışı — en karmaşık ekranlar) |
| **Kişi B** | **Faz 4 → Faz 5 → Faz 6** | Profile, Login, Register, Cinemas, 404/403 + yeni statik sayfalar (about/contact/faq/privacy/terms/kvkk/refund) → Admin paneli (AdminLayout + 12 sayfa — tekrarlayan DataTable/FormDialog deseni) → Dark tema yeniden kurulumu + a11y/QA turu |

Her ikisi 3'er faz, tamamen bağımsız, hiçbir ortak/senkron adım yok.

## Durum

- **Faz 0 (Token temeli)** — tamamlandı, `frontend-revize`'e merge edildi.
- **Faz 1 (Header/Footer kabuğu)** — tamamlandı (Kişi A), final review + fix dalgası dahil,
  `frontend-revize`'e local commit olarak işlendi (push edilmedi).
- **Faz 2-6** — henüz başlamadı.

## Kişi B için başlangıç notu

Faz 0 ve Faz 1 artık doğrudan `frontend-revize` üzerinde (local commit'ler halinde) duruyor — ayrı
bir worktree/branch'ten merge etmeye gerek yok. Kişi B, `frontend-revize`'den kendi dalını açıp Faz
4'e doğrudan başlayabilir; Header/Footer'ın son haline (Faz 1) hiç bakmadan sayfa içeriği üzerinde
çalışabilir — sayfalar `<Outlet>` üzerinden Layout'tan bağımsız render olur, entegrasyon için ayrı
bir senkron adım gerekmez.

## Fazların tam tanımı

Her fazın ne içerdiğinin detaylı açıklaması (bileşen listesi, davranış değişiklikleri, bilinçli
tersine çevirmeler) spec dokümanının §6-§10 bölümlerinde yer alıyor. Bu belge yalnızca "kim hangi
fazı yapıyor" bölüşümünü kayıt altına alıyor; fazların içeriği için spec'e bakılmalı.
