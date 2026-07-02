import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const PERIODE_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const STATUS_OPTIONS = [
  { value: 'belum_bayar', label: 'Belum Bayar' },
  { value: 'lunas', label: 'Lunas' },
];

function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value)
  );
}

export default function TagihanPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tagihan, setTagihan] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredTagihan = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tagihan.filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      if (!q) return true;
      return [t.unit?.nama_unit, t.periode].some((field) => (field || '').toLowerCase().includes(q));
    });
  }, [tagihan, search, statusFilter]);

  async function fetchTagihan() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tagihan');
      setTagihan(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  }

  async function fetchUnitOptions() {
    try {
      const res = await api.get('/units');
      setUnitOptions(res.data.map((u) => ({ value: u.id, label: u.nama_unit })));
    } catch {
      // pemilik tidak butuh opsi ini (form tambah/edit hanya untuk admin)
    }
  }

  useEffect(() => {
    fetchTagihan();
    if (isAdmin) fetchUnitOptions();
  }, [isAdmin]);

  async function handleSubmit(values) {
    const payload = {
      unit_id: Number(values.unit_id),
      periode: values.periode,
      jumlah: Number(values.jumlah),
      status: values.status,
      jatuh_tempo: values.jatuh_tempo,
      tanggal_bayar: values.tanggal_bayar || null,
    };

    if (modalItem.id) {
      await api.put(`/tagihan/${modalItem.id}`, payload);
    } else {
      await api.post('/tagihan', payload);
    }

    setModalItem(null);
    fetchTagihan();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus tagihan periode ${item.periode}?`)) return;
    try {
      await api.delete(`/tagihan/${item.id}`);
      fetchTagihan();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus tagihan');
    }
  }

  const columns = [
    { key: 'unit', label: 'Unit', render: (row) => row.unit?.nama_unit || '-' },
    { key: 'periode', label: 'Periode' },
    { key: 'jumlah', label: 'Jumlah', render: (row) => formatRupiah(row.jumlah) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'lunas' ? 'badge-success' : 'badge-warning'}`}>
          {row.status === 'lunas' ? 'Lunas' : 'Belum Bayar'}
        </span>
      ),
    },
    { key: 'jatuh_tempo', label: 'Jatuh Tempo' },
    { key: 'tanggal_bayar', label: 'Tanggal Bayar', render: (row) => row.tanggal_bayar || '-' },
  ];

  const fields = [
    { name: 'unit_id', label: 'Unit', type: 'select', required: true, options: unitOptions },
    {
      name: 'periode',
      label: 'Periode (YYYY-MM)',
      required: true,
      placeholder: '2026-07',
      validate: (value) => (value && !PERIODE_REGEX.test(value) ? 'Format periode harus YYYY-MM' : null),
    },
    { name: 'jumlah', label: 'Jumlah', type: 'number', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
    { name: 'jatuh_tempo', label: 'Jatuh Tempo', type: 'date', required: true },
    { name: 'tanggal_bayar', label: 'Tanggal Bayar', type: 'date' },
  ];

  return (
    <div className="container">
      <div className="table-toolbar">
        <h1>Tagihan</h1>
        {isAdmin && <Button onClick={() => setModalItem({})}>Tambah Tagihan</Button>}
      </div>

      <Card>
        {error && <div className="error-text">{error}</div>}
        <div className="filter-row">
          <Input
            name="search"
            placeholder="Cari nama unit atau periode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredTagihan}
            actions={
              isAdmin
                ? (row) => (
                    <>
                      <Button variant="secondary" onClick={() => setModalItem(row)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(row)}>
                        Hapus
                      </Button>
                    </>
                  )
                : undefined
            }
          />
        )}
      </Card>

      {modalItem && (
        <Modal title={modalItem.id ? 'Edit Tagihan' : 'Tambah Tagihan'} onClose={() => setModalItem(null)}>
          <EntityForm
            fields={fields}
            initialValues={modalItem.id ? { ...modalItem, unit_id: modalItem.unit?.id } : {}}
            onSubmit={handleSubmit}
            onCancel={() => setModalItem(null)}
            submitLabel={modalItem.id ? 'Simpan Perubahan' : 'Tambah'}
          />
        </Modal>
      )}
    </div>
  );
}
