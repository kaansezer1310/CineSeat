import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import App from "./App.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import CartProvider from "./context/CartProvider.jsx";
import ThemeProvider from "./context/ThemeProvider.jsx";
import WatchlistProvider from "./context/WatchlistProvider.jsx";
import ToastProvider from "./context/ToastProvider.jsx";

/**
 * Duman testi — GERÇEK <App /> ağacını rotalarda render eder.
 *
 * Diğer sayfa testleri bileşenleri İZOLE render ediyor (kendi
 * sağlayıcıları, kendi mock'larıyla). Bu, tarayıcıda patlayan ama birim
 * testlerinde görünmeyen hataları kaçırır: eksik bir rota, App.jsx'te
 * yanlış bir import, Layout/Header ile sayfa arasında bir uyumsuzluk.
 * Burada tam ağaç kuruluyor — sayfa render edilebiliyorsa `npm run dev`
 * de o rotada beyaz ekran vermez.
 */

// Ağ çağrıları bu testin konusu değil: rotanın çökmeden kurulup
// kurulmadığına bakıyoruz. Yalnızca HTTP fiilleri değiştiriliyor —
// `setUnauthorizedHandler` gibi diğer dışa aktarımlar olduğu gibi kalıyor
// (AuthProvider onu mount'ta çağırıyor).
vi.mock("./services/apiClient.js", async (importOriginal) => {
  const actual = await importOriginal();

  // Servisler iki farklı liste şekli bekliyor: kimi doğrudan dizi
  // (`(dtos ?? []).map`), kimi sayfalı zarf (`result.items.map`). Hem dizi
  // hem `items` taşıyan tek bir boş yanıt ikisini de karşılar.
  const emptyList = Object.assign([], { items: [], totalCount: 0 });
  const stub = {
    get: () => Promise.resolve(emptyList),
    post: () => Promise.resolve({}),
    put: () => Promise.resolve({}),
    del: () => Promise.resolve({}),
  };

  return { ...actual, apiClient: stub, default: stub };
});

function renderAt(path) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // Sağlayıcı sırası main.jsx ile BİREBİR aynı; testin gerçekten
  // tarayıcıdaki ağacı temsil etmesi buna bağlı.
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <ThemeProvider>
          <CartProvider>
            <AuthProvider>
              <WatchlistProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </WatchlistProvider>
            </AuthProvider>
          </CartProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

// [rota, sayfada görünmesi beklenen h1]
const PUBLIC_ROUTES = [
  ["/movies", "Vizyondaki Filmler"],
  ["/cinemas", "Sinemalarımız"],
  ["/campaigns", "Kampanyalar"],
  ["/login", "Giriş Yap"],
  ["/register", "Kayıt Ol"],
  ["/about", "Hakkımızda"],
  ["/contact", "İletişim"],
  ["/faq", "Sıkça Sorulan Sorular"],
  ["/privacy", "Gizlilik Politikası"],
  ["/terms", "Kullanım Koşulları"],
  ["/kvkk", "KVKK Aydınlatma Metni"],
  ["/refund", "İptal ve İade"],
  ["/forbidden", "Bu sayfaya erişim izniniz yok"],
  ["/bilinmeyen-adres", "Sayfa bulunamadı"],
];

describe("App duman testi", () => {
  // `findByRole` (async): bazı sayfalar önce bir yükleniyor başlığı
  // gösterip sorgu çözülünce asıl başlığa geçiyor (ör. /movies).
  it.each(PUBLIC_ROUTES)(
    "%s rotası çökmeden render olur",
    async (path, heading) => {
      renderAt(path);

      expect(
        await screen.findByRole("heading", { level: 1, name: heading })
      ).toBeInTheDocument();
    }
  );

  it("ana sayfa hero'suyla birlikte render olur", () => {
    renderAt("/");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Bileti telefonundan al/,
      })
    ).toBeInTheDocument();
  });

  it("her rotada kabuk (header + footer) yerinde durur", () => {
    renderAt("/faq");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "İçeriğe geç" })
    ).toBeInTheDocument();
  });

  it("Footer'ın verdiği yasal bağlantıların hepsi gerçek bir sayfaya gider", () => {
    // Faz 1'de bu rotalar henüz yoktu ve Footer 404'e bağlanıyordu.
    renderAt("/");

    const footer = screen.getByRole("contentinfo");

    ["/about", "/contact", "/faq", "/privacy", "/terms", "/kvkk", "/refund"]
      .forEach((href) => {
        const link = footer.querySelector(`a[href="${href}"]`);

        expect(link, `Footer'da ${href} bağlantısı`).not.toBeNull();
      });
  });
});
