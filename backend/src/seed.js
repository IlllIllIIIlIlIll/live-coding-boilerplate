require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Unit, Tagihan } = require('./models');

async function seed() {
  await sequelize.authenticate();
  const shouldAlter = process.env.DB_SYNC_ALTER !== 'false';
  await sequelize.sync(shouldAlter ? { alter: true } : {});

  const adminPassword = await bcrypt.hash('admin123', 10);
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@example.com' },
    defaults: {
      nama: 'Admin Utama',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const pemilikPassword = await bcrypt.hash('pemilik123', 10);
  const [pemilik1] = await User.findOrCreate({
    where: { email: 'budi@example.com' },
    defaults: {
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      no_hp: '081234567890',
      password: pemilikPassword,
      role: 'pemilik',
    },
  });

  const [pemilik2] = await User.findOrCreate({
    where: { email: 'siti@example.com' },
    defaults: {
      nama: 'Siti Aminah',
      email: 'siti@example.com',
      no_hp: '081298765432',
      password: pemilikPassword,
      role: 'pemilik',
    },
  });

  await User.findOrCreate({
    where: { email: 'izza.diasputra10@gmail.com' },
    defaults: {
      nama: 'Favian',
      email: 'izza.diasputra10@gmail.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  const [favian] = await User.findOrCreate({
    where: { email: '18222070@std.stei.itb.ac.id' },
    defaults: {
      nama: 'Favian',
      email: '18222070@std.stei.itb.ac.id',
      password: pemilikPassword,
      role: 'pemilik',
    },
  });

  const [unitA] = await Unit.findOrCreate({
    where: { nama_unit: 'A-12' },
    defaults: {
      nama_unit: 'A-12',
      alamat: 'Jl. Melati No. 12',
      pemilik_id: pemilik1.id,
      status: 'aktif',
    },
  });

  const [unitB] = await Unit.findOrCreate({
    where: { nama_unit: 'B-05' },
    defaults: {
      nama_unit: 'B-05',
      alamat: 'Jl. Mawar No. 5',
      pemilik_id: pemilik2.id,
      status: 'aktif',
    },
  });

  await Unit.findOrCreate({
    where: { nama_unit: 'C-01' },
    defaults: {
      nama_unit: 'C-01',
      alamat: 'Jl. Anggrek No. 1',
      pemilik_id: favian.id,
      status: 'aktif',
    },
  });

  await Tagihan.findOrCreate({
    where: { unit_id: unitA.id, periode: '2026-06' },
    defaults: {
      unit_id: unitA.id,
      periode: '2026-06',
      jumlah: 500000,
      status: 'lunas',
      jatuh_tempo: '2026-06-10',
      tanggal_bayar: '2026-06-08',
    },
  });

  await Tagihan.findOrCreate({
    where: { unit_id: unitA.id, periode: '2026-07' },
    defaults: {
      unit_id: unitA.id,
      periode: '2026-07',
      jumlah: 500000,
      status: 'belum_bayar',
      jatuh_tempo: '2026-07-10',
      tanggal_bayar: null,
    },
  });

  await Tagihan.findOrCreate({
    where: { unit_id: unitB.id, periode: '2026-07' },
    defaults: {
      unit_id: unitB.id,
      periode: '2026-07',
      jumlah: 750000,
      status: 'belum_bayar',
      jatuh_tempo: '2026-07-15',
      tanggal_bayar: null,
    },
  });

  console.log('Seed selesai.');
  console.log('Admin login: admin@example.com / admin123');
  console.log('Admin login: izza.diasputra10@gmail.com / admin123');
  console.log('Pemilik login: budi@example.com / pemilik123 (unit A-12)');
  console.log('Pemilik login: siti@example.com / pemilik123 (unit B-05)');
  console.log('Pemilik login: 18222070@std.stei.itb.ac.id / pemilik123 (unit C-01)');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed gagal:', err.message);
  process.exit(1);
});
