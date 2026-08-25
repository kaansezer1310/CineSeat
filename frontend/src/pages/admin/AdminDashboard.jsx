import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CSVLink } from "react-csv";

import reservationService from "../../services/reservationService.js";
import PageHeader from "../../components/ui/PageHeader.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import StatusPanel from "../../components/ui/StatusPanel.jsx";

// --- Grafik ortak ayarlari -------------------------------------------------
// Cubuk kalinligi capleniyor: iki filmlik bir veri setinde cubuklar aksi halde
// panelin yarisi kadar genisliyordu.
const BAR_MAX = 24;
const BAR_RADIUS = [4, 4, 0, 0];
const CHART_MARGIN = { top: 20, right: 8, bottom: 0, left: 0 };

// Az sayida cubukta degeri okumak icin fareyle gezinmek gerekmesin. Her
// noktaya etiket koymak gurultu olurdu; sinir buyudukce etiketler birbirine
// girecegi icin yalnizca kucuk veri setlerinde gosteriliyor.
const DIRECT_LABEL_LIMIT = 6;

const LABEL_STYLE = { fill: "var(--color-text-muted)", fontSize: 12 };

// Eksen ve izgara geri planda kalmali; veri onde olsun.
const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 12, fill: "var(--color-text-muted)" },
};

const TOOLTIP_PROPS = {
  // Varsayilan imlec acik gri bir dikdortgen ciziyordu; koyu temada beyaz bir
  // blok gibi gorunup "secili" izlenimi veriyordu. Iki temada da calisan,
  // notr ve saydam bir vurgu.
  cursor: { fill: "rgba(128, 128, 128, 0.14)" },
  contentStyle: {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border-strong)",
    borderRadius: "10px",
    fontSize: "0.85rem",
  },
  labelStyle: { color: "var(--color-text)", fontWeight: 600 },
  itemStyle: { color: "var(--color-text-muted)" },
};

function formatAxisNumber(value) {
  return Number(value).toLocaleString("tr-TR");
}

/**
 * Tek serilik bir grafigi baslik ve durum yonetimiyle sarar.
 *
 * Efsane (legend) yok: tek seri oldugunda baslik zaten seriyi adlandiriyor,
 * ikinci bir etiket gurultuden ibaret olurdu.
 */
function ChartCard({ title, isLoading, isEmpty, children }) {
  return (
    <section className="admin-chart-card">
      <h2 className="admin-chart-title">{title}</h2>

      {isLoading ? (
        <StatusPanel variant="loading" title="Rapor hazirlaniyor..." />
      ) : isEmpty ? (
        <p className="admin-chart-empty">
          Henuz tamamlanmis bir rezervasyon yok.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          {children}
        </ResponsiveContainer>
      )}
    </section>
  );
}

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

      {/* Bilet ADEDI ile GELIR ayri grafiklerde. Onceden ikisi tek eksende
          gruplu cubuklardi; olcekleri birbirinden cok uzak oldugu icin (adet
          onlu, gelir binli) bilet cubuklari gelirin yaninda gorunmez
          kaliyordu. Ayni eksende farkli olcekli iki olcu okunamaz. */}
      <div className="admin-chart-grid">
        <ChartCard
          title="Film başına satılan bilet"
          isLoading={isLoading}
          isEmpty={stats.length === 0}
        >
          <BarChart data={stats} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} className="chart-grid" />
            <XAxis dataKey="name" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={36} allowDecimals={false} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar
              dataKey="bilet"
              name="Satılan bilet"
              className="chart-bar-1"
              radius={BAR_RADIUS}
              maxBarSize={BAR_MAX}
            >
              {stats.length <= DIRECT_LABEL_LIMIT && (
                <LabelList dataKey="bilet" position="top" style={LABEL_STYLE} />
              )}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Film başına gelir (TL)"
          isLoading={isLoading}
          isEmpty={stats.length === 0}
        >
          <BarChart data={stats} margin={CHART_MARGIN}>
            <CartesianGrid vertical={false} className="chart-grid" />
            <XAxis dataKey="name" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} width={56} tickFormatter={formatAxisNumber} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Bar
              dataKey="gelir"
              name="Gelir (TL)"
              className="chart-bar-2"
              radius={BAR_RADIUS}
              maxBarSize={BAR_MAX}
            >
              {stats.length <= DIRECT_LABEL_LIMIT && (
                <LabelList
                  dataKey="gelir"
                  position="top"
                  style={LABEL_STYLE}
                  formatter={formatAxisNumber}
                />
              )}
            </Bar>
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
