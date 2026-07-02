import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value)
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="stat-card">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      setError('');
      try {
        if (isAdmin) {
          const [pemilikRes, unitRes, tagihanRes] = await Promise.all([
            api.get('/pemilik'),
            api.get('/units'),
            api.get('/tagihan'),
          ]);
          const belumBayar = tagihanRes.data.filter((t) => t.status === 'belum_bayar');
          setStats({
            totalPemilik: pemilikRes.data.length,
            totalUnit: unitRes.data.length,
            unitAktif: unitRes.data.filter((u) => u.status === 'aktif').length,
            totalTagihanBelumBayar: belumBayar.length,
            nilaiBelumBayar: belumBayar.reduce((sum, t) => sum + Number(t.jumlah), 0),
          });
        } else {
          const [unitRes, tagihanRes] = await Promise.all([api.get('/units'), api.get('/tagihan')]);
          const belumBayar = tagihanRes.data.filter((t) => t.status === 'belum_bayar');
          setStats({
            totalUnit: unitRes.data.length,
            totalTagihanBelumBayar: belumBayar.length,
            nilaiBelumBayar: belumBayar.reduce((sum, t) => sum + Number(t.jumlah), 0),
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat ringkasan dashboard');
      } finally {
        setLoading(false);
      }
    }

    if (user) loadStats();
  }, [user, isAdmin]);

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p className="helper-text">Selamat datang, {user?.nama} ({user?.role})</p>

      {error && <div className="error-text">{error}</div>}
      {loading && <p>Memuat...</p>}

      {stats && (
        <div className="stats-grid">
          {isAdmin && <StatCard label="Total Pemilik" value={stats.totalPemilik} />}
          <StatCard label="Total Unit" value={stats.totalUnit} />
          {isAdmin && <StatCard label="Unit Aktif" value={stats.unitAktif} />}
          <StatCard label="Tagihan Belum Bayar" value={stats.totalTagihanBelumBayar} />
          <StatCard label="Total Nilai Belum Bayar" value={formatRupiah(stats.nilaiBelumBayar)} />
        </div>
      )}
    </div>
  );
}
