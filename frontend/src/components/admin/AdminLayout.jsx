import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

import useAuth from '../../hooks/useAuth.js';
import { PERMISSIONS } from '../../domain/permissions.js';
import './admin.css';

/**
 * Kenar çubuğu bölümleri. Her bölüm ve her bağlantı, gerektirdiği izinlerden
 * en az birine sahip kullanıcıya gösterilir; hiçbir bağlantısı görünmeyen
 * bölüm hiç render edilmez.
 *
 * Yeni admin ekranları buraya eklenir — ekran yazılmadan bağlantı eklenmez,
 * aksi hâlde kullanıcı 404'e düşer.
 */
const NAVIGATION_SECTIONS = [
  {
    title: 'Raporlar',
    items: [
      {
        to: '/admin',
        end: true,
        label: 'İstatistikler',
        permissions: [PERMISSIONS.RESERVATION_READ],
      },
    ],
  },
  {
    title: 'Katalog',
    items: [
      {
        to: '/admin/movies',
        label: 'Filmler',
        permissions: [PERMISSIONS.MOVIE_MANAGE],
      },
    ],
  },
];

function navigationLinkClass({ isActive }) {
  return isActive
    ? 'admin-nav-link admin-nav-link-active'
    : 'admin-nav-link';
}

export default function AdminLayout() {
  const { user, logout, canAny } = useAuth();

  const visibleSections = NAVIGATION_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAny(item.permissions)),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="admin-layout">
      {/* K3: panele giren kullanıcının siteye dönüş ve çıkış yolu.
          Önceden yalnızca tarayıcının geri tuşu vardı. */}
      <header className="admin-topbar">
        <div className="admin-topbar-brand">
          <Link to="/admin" className="admin-topbar-logo">
            CineSeat Yönetim
          </Link>
        </div>

        <div className="admin-topbar-actions">
          {user && (
            <span className="admin-topbar-user">
              {user.name}
              <span className="admin-topbar-role">Yönetici</span>
            </span>
          )}

          <Link to="/" className="admin-btn admin-btn-cancel">
            ← Siteye Dön
          </Link>

          <button
            type="button"
            onClick={logout}
            className="admin-btn admin-btn-cancel"
          >
            Çıkış
          </button>
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          <nav aria-label="Yönetim menüsü">
            {visibleSections.map((section) => (
              <div className="admin-nav-section" key={section.title}>
                <h2 className="admin-nav-section-title">{section.title}</h2>

                <ul className="admin-nav-list">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        className={navigationLinkClass}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <main className="admin-content">
          {/* Alt ekranlar tembel yükleniyor; bu sınır sayesinde yükleme
              sırasında yalnızca içerik alanı bekliyor, kabuk yerinde kalıyor. */}
          <Suspense
            fallback={<p className="admin-empty-text">Yükleniyor…</p>}
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
