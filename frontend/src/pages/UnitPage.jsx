import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

const STATUS_OPTIONS = [
  { value: 'aktif', label: 'Aktif' },
  { value: 'nonaktif', label: 'Nonaktif' },
];

export default function UnitPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [units, setUnits] = useState([]);
  const [pemilikOptions, setPemilikOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalUnit, setModalUnit] = useState(null); // null = closed, {} = create, {...} = edit
  const [search, setSearch] = useState('');

  const filteredUnits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return units;
    return units.filter((u) =>
      [u.nama_unit, u.alamat, u.pemilik?.nama, u.status].some((field) =>
        (field || '').toLowerCase().includes(q)
      )
    );
  }, [units, search]);

  async function fetchUnits() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/units');
      setUnits(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data unit');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPemilikOptions() {
    try {
      const res = await api.get('/pemilik');
      setPemilikOptions(res.data.map((p) => ({ value: p.id, label: p.nama })));
    } catch {
      // pemilik role tidak punya akses; abaikan (form tambah/edit tidak dipakai)
    }
  }

  useEffect(() => {
    fetchUnits();
    if (isAdmin) fetchPemilikOptions();
  }, [isAdmin]);

  async function handleSubmit(values) {
    const payload = {
      nama_unit: values.nama_unit,
      alamat: values.alamat,
      pemilik_id: Number(values.pemilik_id),
      status: values.status,
    };

    if (modalUnit.id) {
      await api.put(`/units/${modalUnit.id}`, payload);
    } else {
      await api.post('/units', payload);
    }

    setModalUnit(null);
    fetchUnits();
  }

  async function handleDelete(unit) {
    if (!window.confirm(`Hapus unit ${unit.nama_unit}?`)) return;
    try {
      await api.delete(`/units/${unit.id}`);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus unit');
    }
  }

  const columns = [
    { key: 'nama_unit', label: 'Nama Unit' },
    { key: 'alamat', label: 'Alamat' },
    { key: 'pemilik', label: 'Pemilik', render: (row) => row.pemilik?.nama || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`badge ${row.status === 'aktif' ? 'badge-success' : 'badge-warning'}`}>
          {row.status}
        </span>
      ),
    },
  ];

  const fields = [
    { name: 'nama_unit', label: 'Nama Unit', required: true },
    { name: 'alamat', label: 'Alamat' },
    { name: 'pemilik_id', label: 'Pemilik', type: 'select', required: true, options: pemilikOptions },
    { name: 'status', label: 'Status', type: 'select', required: true, options: STATUS_OPTIONS },
  ];

  return (
    <div className="container">
      <div className="table-toolbar">
        <h1>Unit</h1>
        {isAdmin && <Button onClick={() => setModalUnit({})}>Tambah Unit</Button>}
      </div>

      <Card>
        {error && <div className="error-text">{error}</div>}
        <Input
          name="search"
          placeholder="Cari nama unit, alamat, atau pemilik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredUnits}
            actions={
              isAdmin
                ? (row) => (
                    <>
                      <Button variant="secondary" onClick={() => setModalUnit(row)}>
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

      {modalUnit && (
        <Modal title={modalUnit.id ? 'Edit Unit' : 'Tambah Unit'} onClose={() => setModalUnit(null)}>
          <EntityForm
            fields={fields}
            initialValues={modalUnit}
            onSubmit={handleSubmit}
            onCancel={() => setModalUnit(null)}
            submitLabel={modalUnit.id ? 'Simpan Perubahan' : 'Tambah'}
          />
        </Modal>
      )}
    </div>
  );
}
