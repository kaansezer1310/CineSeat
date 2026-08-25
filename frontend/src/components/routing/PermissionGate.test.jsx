import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import AuthProvider from "../../context/AuthProvider.jsx";
import CartProvider from "../../context/CartProvider.jsx";
import { PERMISSIONS } from "../../constants/permissions.js";
import PermissionGate from "./PermissionGate.jsx";

/**
 * Yetkiye göre arayüz gösterme/gizleme. Planın kabul testi dört profili
 * istiyor: misafir, sıradan kullanıcı, kısıtlı yetkili, tam yetkili yönetici.
 * Buradaki testler dördünü de tek tek kuruyor.
 *
 * Not: bu bir gizleme katmanı, güvenlik sınırı değil. Asıl kontrol backend'de;
 * izin matrisi entegrasyon testleriyle ayrıca ölçülüyor.
 */
function signIn(permissions) {
  sessionStorage.setItem(
    "cineseat_user",
    JSON.stringify({
      id: 1,
      username: "test",
      role: "Admin",
      permissions,
      token: "test-token",
    })
  );
}

function renderGate(props) {
  return render(
    // AuthProvider cikista sepeti temizledigi icin CartProvider'a bagli.
    <CartProvider>
      <AuthProvider>
        <PermissionGate {...props}>
          <p>Yönetim içeriği</p>
        </PermissionGate>
      </AuthProvider>
    </CartProvider>
  );
}

const gorunur = () => screen.queryByText("Yönetim içeriği") !== null;

beforeEach(() => {
  sessionStorage.clear();
});

describe("PermissionGate — rol profilleri", () => {
  it("misafire hiçbir yönetim içeriği göstermez", () => {
    // Oturum yok: izin listesi bos.
    renderGate({ permissions: [PERMISSIONS.MOVIE_MANAGE] });

    expect(gorunur()).toBe(false);
  });

  it("izinsiz kullanıcıya göstermez", () => {
    signIn([]);

    renderGate({ permissions: [PERMISSIONS.MOVIE_MANAGE] });

    expect(gorunur()).toBe(false);
  });

  it("kısıtlı yetkiliye yalnızca sahip olduğu bölümü gösterir", () => {
    // Yalnizca film yonetimi olan bir yetkili.
    signIn([PERMISSIONS.MOVIE_MANAGE]);

    const { unmount } = renderGate({ permissions: [PERMISSIONS.MOVIE_MANAGE] });
    expect(gorunur()).toBe(true);
    unmount();

    renderGate({ permissions: [PERMISSIONS.USER_MANAGE] });
    expect(gorunur()).toBe(false);
  });

  it("tam yetkili yöneticiye gösterir", () => {
    signIn(Object.values(PERMISSIONS));

    renderGate({ permissions: [PERMISSIONS.USER_MANAGE] });

    expect(gorunur()).toBe(true);
  });
});

describe("PermissionGate — mod davranışı", () => {
  it("varsayılan modda izinlerin TAMAMINI ister", () => {
    signIn([PERMISSIONS.MOVIE_MANAGE]);

    renderGate({
      permissions: [PERMISSIONS.MOVIE_MANAGE, PERMISSIONS.USER_MANAGE],
    });

    // Ikisinden yalnizca biri var; "all" modu reddetmeli.
    expect(gorunur()).toBe(false);
  });

  it("any modunda izinlerden BİRİ yeter", () => {
    signIn([PERMISSIONS.MOVIE_MANAGE]);

    renderGate({
      permissions: [PERMISSIONS.MOVIE_MANAGE, PERMISSIONS.USER_MANAGE],
      mode: "any",
    });

    expect(gorunur()).toBe(true);
  });

  it("any modunda hiçbiri yoksa göstermez", () => {
    signIn([PERMISSIONS.CINEMA_MANAGE]);

    renderGate({
      permissions: [PERMISSIONS.MOVIE_MANAGE, PERMISSIONS.USER_MANAGE],
      mode: "any",
    });

    expect(gorunur()).toBe(false);
  });
});

describe("PermissionGate — yedek içerik", () => {
  it("izin yoksa verilen yedeği gösterir", () => {
    signIn([]);

    render(
      <CartProvider>
        <AuthProvider>
          <PermissionGate
            permissions={[PERMISSIONS.MOVIE_MANAGE]}
            fallback={<p>Bu bölüme erişiminiz yok.</p>}
          >
            <p>Yönetim içeriği</p>
          </PermissionGate>
        </AuthProvider>
      </CartProvider>
    );

    expect(screen.getByText("Bu bölüme erişiminiz yok.")).toBeInTheDocument();
    expect(gorunur()).toBe(false);
  });

  it("yedek verilmediğinde hiçbir şey çizmez", () => {
    signIn([]);

    const { container } = renderGate({
      permissions: [PERMISSIONS.MOVIE_MANAGE],
    });

    // Bos bir kapsayici degil, hic dugum birakmamali.
    expect(container).toBeEmptyDOMElement();
  });
});
