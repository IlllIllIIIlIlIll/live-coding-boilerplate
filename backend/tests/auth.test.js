const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

// Menguji endpoint auth login + /auth/me. Berjalan terhadap database yang sudah
// di-seed (npm run seed) — bukan mock, karena tujuannya "unit test dasar" untuk
// membuktikan alur login+JWT bekerja end-to-end sesuai SPEC bagian 5 & 9.
describe('POST /api/auth/login', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  it('menolak request tanpa identifier/password (400)', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('menolak password yang salah (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin@example.com', password: 'password-salah' });

    expect(res.status).toBe(401);
  });

  it('menolak identifier yang tidak terdaftar (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'tidak-ada@example.com', password: 'apapun' });

    expect(res.status).toBe(401);
  });

  it('berhasil login dengan email + password, mengembalikan JWT tanpa password hash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin@example.com', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({ email: 'admin@example.com', role: 'admin' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('berhasil login dengan no_hp sebagai identifier', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: '081234567890', password: 'pemilik123' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('pemilik');
  });

  it('GET /api/auth/me menolak tanpa token (401) dan berhasil dengan token valid', async () => {
    const noToken = await request(app).get('/api/auth/me');
    expect(noToken.status).toBe(401);

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'admin@example.com', password: 'admin123' });

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('admin@example.com');
    expect(me.body.user.password).toBeUndefined();
  });
});
