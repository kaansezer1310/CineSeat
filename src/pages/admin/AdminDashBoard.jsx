import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CSVLink } from 'react-csv';
import reservationService from '../../services/reservationService';

export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const mockStats = [
        { name: 'Neon Yağmuru', bilet: 120, gelir: 12000 },
        { name: 'Kalkan', bilet: 95, gelir: 9500 },
        { name: 'Yanlış Düğün', bilet: 150, gelir: 15000 },
        { name: 'Üçüncü Kat', bilet: 60, gelir: 6000 },
      ];
      
      setStats(mockStats);
      
      const toplamBilet = mockStats.reduce((acc, curr) => acc + curr.bilet, 0);
      const toplamGelir = mockStats.reduce((acc, curr) => acc + curr.gelir, 0);
      
      setTotalTickets(toplamBilet);
      setTotalRevenue(toplamGelir);
    };

    loadStats();
  }, []);

  const csvHeaders = [
    { label: "Film Adı", key: "name" },
    { label: "Satılan Bilet", key: "bilet" },
    { label: "Toplam Gelir (TL)", key: "gelir" }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1> İstatistikler & Raporlar</h1>
        <CSVLink 
          data={stats} 
          headers={csvHeaders} 
          filename="cineseat-satis-raporu.csv"
          className="admin-btn admin-btn-export"
        >
           CSV Olarak İndir
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
      </div>
    </div>
  );
}
