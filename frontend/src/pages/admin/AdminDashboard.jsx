import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CSVLink } from "react-csv";
import reservationService from "../../services/reservationService.js";

function buildStatsByMovie(reservations) {
  const statsByMovie = new Map();

  reservations.forEach((reservation) => {
    reservation.items.forEach((item) => {
      const existing = statsByMovie.get(item.movieTitle) ?? {
        name: item.movieTitle,
        bilet: 0,
        gelir: 0,
      };

      existing.bilet += item.seats.length;
      existing.gelir += item.seats.length * item.unitPrice;

      statsByMovie.set(item.movieTitle, existing);
    });
  });

  return Array.from(statsByMovie.values());
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);

      try {
        const reservations = await reservationService.getAllReservations();

        setStats(buildStatsByMovie(reservations));
      } catch (error) {
        console.error("İstatistikler yüklenirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const totalTickets = stats.reduce((acc, curr) => acc + curr.bilet, 0);
  const totalRevenue = stats.reduce((acc, curr) => acc + curr.gelir, 0);

  const csvHeaders = [
    { label: "Film Adı", key: "name" },
    { label: "Satılan Bilet", key: "bilet" },
    { label: "Toplam Gelir (TL)", key: "gelir" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>📊 İstatistikler & Raporlar</h1>
        <CSVLink
          data={stats}
          headers={csvHeaders}
          filename="cineseat-satis-raporu.csv"
          className="admin-btn admin-btn-export"
        >
          📥 CSV Olarak İndir
        </CSVLink>
      </div>

      <div className="admin-stats-cards">
        <div className="admin-stat-card">
          <h3>Toplam Satılan Bilet</h3>
          <p>{totalTickets} Adet</p>
        </div>
        <div className="admin-stat-card">
          <h3>Toplam Gelir</h3>
          <p>{totalRevenue.toLocaleString()} TL</p>
        </div>
      </div>

      <div className="admin-chart-container">
        <h2>Film Bazlı Satış Grafiği</h2>
        {isLoading ? (
          <p>Yükleniyor...</p>
        ) : stats.length === 0 ? (
          <p>Henüz tamamlanmış bir rezervasyon yok.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bilet" fill="#8884d8" name="Satılan Bilet" />
              <Bar dataKey="gelir" fill="#82ca9d" name="Gelir (TL)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
