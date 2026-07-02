import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import EntityForm from '../components/EntityForm';

export default function PemilikPage() {
  const [pemilik, setPemilik] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [search, setSearch] = useState('');

  const filteredPemilik = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pemilik;
    return pemilik.filter((p) =>
      [p.nama, p.email, p.no_hp].some((field) => (field || '').toLowerCase().includes(q))
    );
  }, [pemilik, search]);

  async function fetchPemilik() {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/pemilik');
      setPemilik(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data pemilik');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPemilik();
  }, []);

  async function handleSubmit(values) {
    const payload = {
      nama: values.nama,
      email: values.email || null,
      no_hp: values.no_hp || null,
    };
    if (values.password) payload.password = values.password;

    if (modalItem.id) {
      await api.put(`/pemilik/${modalItem.id}`, payload);
    } else {
      await api.post('/pemilik', payload);
    }

    setModalItem(null);
    fetchPemilik();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus pemilik ${item.nama}?`)) return;
    try {
      await api.delete(`/pemilik/${item.id}`);
      fetchPemilik();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pemilik');
    }
  }

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'email', label: 'Email', render: (row) => row.email || '-' },
    { key: 'no_hp', label: 'No HP', render: (row) => row.no_hp || '-' },
  ];

  const isEditing = Boolean(modalItem?.id);
  const fields = [
    { name: 'nama', label: 'Nama', required: true },
    {
      name: 'email',
      label: 'Email',
      validate: (value, values) =>
        !value && !values.no_hp ? 'Wajib mengisi salah satu dari email atau no_hp' : null,
    },
    {
      name: 'no_hp',
      label: 'No HP',
      validate: (value, values) =>
        !value && !values.email ? 'Wajib mengisi salah satu dari email atau no_hp' : null,
    },
    {
      name: 'password',
      label: isEditing ? 'Password Baru (opsional)' : 'Password',
      type: 'password',
      required: !isEditing,
    },
  ];

  return (
    <div className="container">
      <div className="table-toolbar">
        <h1>Pemilik</h1>
        <Button onClick={() => setModalItem({})}>Tambah Pemilik</Button>
      </div>

      <Card>
        {error && <div className="error-text">{error}</div>}
        <Input
          name="search"
          placeholder="Cari nama, email, atau no HP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredPemilik}
            actions={(row) => (
              <>
                <Button variant="secondary" onClick={() => setModalItem(row)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(row)}>
                  Hapus
                </Button>
              </>
            )}
          />
        )}
      </Card>

      {modalItem && (
        <Modal title={isEditing ? 'Edit Pemilik' : 'Tambah Pemilik'} onClose={() => setModalItem(null)}>
          <EntityForm
            fields={fields}
            initialValues={modalItem}
            onSubmit={handleSubmit}
            onCancel={() => setModalItem(null)}
            submitLabel={isEditing ? 'Simpan Perubahan' : 'Tambah'}
          />
        </Modal>
      )}
    </div>
  );
}
