import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import { isPushSupported, getSubscriptionStatus, subscribeToPush, unsubscribeFromPush } from '../services/push';

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

function PushNotificationCard({ isAdmin }) {
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [lastPush, setLastPush] = useState(null);
  const supported = isPushSupported();

  useEffect(() => {
    if (!supported) return;
    getSubscriptionStatus().then((sub) => setSubscribed(Boolean(sub)));

    function onMessage(event) {
      if (event.data?.type === 'push-received') {
        setLastPush(event.data.payload);
      }
    }
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [supported]);

  async function handleSubscribe() {
    setBusy(true);
    setMessage('');
    try {
      await subscribeToPush();
      setSubscribed(true);
      setMessage('Notifikasi push aktif.');
    } catch (err) {
      setMessage(err.message || 'Gagal mengaktifkan notifikasi');
    } finally {
      setBusy(false);
    }
  }

  async function handleUnsubscribe() {
    setBusy(true);
    setMessage('');
    try {
      await unsubscribeFromPush();
      setSubscribed(false);
      setMessage('Notifikasi push dinonaktifkan.');
    } catch (err) {
      setMessage(err.message || 'Gagal menonaktifkan notifikasi');
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckNow() {
    setBusy(true);
    setMessage('');
    try {
      const res = await api.post('/push/check-now');
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal memeriksa tagihan jatuh tempo');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Notifikasi Push (Tagihan Jatuh Tempo)">
      {!supported && <p className="helper-text">Browser ini tidak mendukung push notification.</p>}
      {supported && (
        <>
          <p className="helper-text">
            Status: {subscribed ? 'Aktif' : 'Belum aktif'}. Notifikasi dikirim otomatis secara
            berkala saat {isAdmin ? 'ada tagihan (mana pun) yang' : 'tagihan unit Anda'} belum
            bayar dan sudah lewat jatuh tempo.
          </p>
          <div className="form-actions">
            {!subscribed ? (
              <Button onClick={handleSubscribe} disabled={busy}>
                Aktifkan Notifikasi
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleUnsubscribe} disabled={busy}>
                Nonaktifkan
              </Button>
            )}
            <Button variant="secondary" onClick={handleCheckNow} disabled={busy || !subscribed}>
              Reset &amp; Kirim Ulang (demo)
            </Button>
          </div>
          {message && <p className="helper-text">{message}</p>}
          {lastPush && (
            <p className="helper-text" data-testid="last-push">
              Push terakhir diterima: {lastPush.title} — {lastPush.body}
            </p>
          )}
        </>
      )}
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

      <PushNotificationCard isAdmin={isAdmin} />
    </div>
  );
}
