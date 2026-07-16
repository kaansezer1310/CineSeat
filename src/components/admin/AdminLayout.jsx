import { Link, Outlet } from 'react-router-dom';
import './admin.css'; // Local styles

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul className="admin-nav-list">
            <li>
              <Link to="/admin" className="admin-nav-link">📊 İstatistikler</Link>
            </li>
            <li>
              <Link to="/admin/movies" className="admin-nav-link">🎬 Filmleri Yönet</Link>
            </li>
            <li>
              <Link to="/cinemas" className="admin-nav-link">📍 Sinemalar (Ön Yüz)</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* İÇERİK ALANI */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}