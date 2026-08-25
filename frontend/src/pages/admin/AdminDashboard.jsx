import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CSVLink } from "react-csv";

import reservationService from "../../services/reservationService.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusPanel from "../../components/ui/StatusPanel.jsx";

// Rapor artık gerçek rezervasyon verisinden üretiliyor
// (GET /api/reservations, reservation.read izniyle korunuyor). Önceden bu
// sayılar o tarayıcının localStorage'ındaki sahte kayıtlardan hesaplanıyor,
// CSV dışa aktarımı da aynı veriyi gerçekmiş gibi dışarı veriyordu.
function buildStatsByMovie(reservations) {
  const statsByMovie = new Map();

  reservations.forEach((reservation) => {
    const existing = statsByMovie.get(reservation.movieTitle) ?? {
      name: reservation.movieTitle,
      bilet: 0,
      gelir: 0,
    };

    existing.bilet += reservation.ticketCount;
    existing.gelir += reservation.total;

    statsByMovie.set(reservation.movieTitle, existing);
  });

  return Array.from(statsByMovie.values()).sort(
    (a, b) => b.gelir - a.gelir
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadStats = async () => {
      setIsLoading(true);
      setError("");

      try {
        // İptal edilenler ciroya girmemeli.
        const { items } = await reservationService.getAllReservations({
          status: "Completed",
        });

        if (!isCancelled) {
          setStats(buildStatsByMovie(items));
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError(
            loadError.message || "İstatistikler yüklenemedi."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isCancelled = true;
    };
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
      <PageHeader
        title="İstatistikler & Raporlar"
        description="Tamamlanmış rezervasyonlardan üretilen film bazlı satış raporu."
        actions={
          <CSVLink
            data={stats}
            headers={csvHeaders}
            filename="cineseat-satis-raporu.csv"
            className="admin-btn admin-btn-export"
          >
            CSV Olarak İndir
          </CSVLink>
        }
      />

      {error && (
        <StatusPanel
          variant="error"
          title="İstatistikler yüklenemedi"
          description={error}
        />
      )}

      <div className="admin-stats-cards">
        <StatCard
          label="Toplam Satılan Bilet"
          value={totalTickets}
          suffix="Adet"
          isLoading={isLoading}
        />

        <StatCard
          label="Toplam Gelir"
          value={totalRevenue.toLocaleString("tr-TR")}
          suffix="TL"
          isLoading={isLoading}
        />
      </div>

      <div className="admin-chart-container">
        <h2>Film Bazlı Satış Grafiği</h2>
        {isLoading ? (
          <StatusPanel variant="loading" title="Rapor hazırlanıyor…" />
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
