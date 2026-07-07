import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const [mode, setMode] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Callback dari Google OAuth: backend redirect ke /login?token=...
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    loginWithToken(token)
      .then(() => navigate('/dashboard', { replace: true }))
      .catch(() => setError('Login Google gagal, silakan coba lagi'));
  }, [searchParams]);

  function handleGoogleLogin() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/google`;
  }

  return (
    <div className="login-page">
      <Card title="Masuk" className="login-card">
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'password' ? 'active' : ''}`}
            onClick={() => {
              setMode('password');
              setError('');
            }}
          >
            Password
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setMode('otp');
              setError('');
            }}
          >
            OTP Email
          </button>
        </div>

        {error && <div className="error-text">{error}</div>}

        {mode === 'password' && (
          <PasswordLoginForm
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            loginWithToken={loginWithToken}
            navigate={navigate}
          />
        )}

        {mode === 'otp' && (
          <OtpLoginForm
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            loginWithToken={loginWithToken}
            navigate={navigate}
          />
        )}

        <div className="divider">atau</div>

        <Button variant="secondary" onClick={handleGoogleLogin} style={{ width: '100%' }}>
          Login dengan Google
        </Button>

        <p className="helper-text" style={{ textAlign: 'center', marginTop: 16, marginBottom: 8 }}>
          Untuk mengunduh aplikasi Android, silakan klik tombol di bawah ini.
        </p>
        <a
          href="/MyJarrdinApp.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          Unduh Aplikasi Android
        </a>
      </Card>
    </div>
  );
}

function PasswordLoginForm({ loading, setLoading, setError, loginWithToken, navigate }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  function validate() {
    const errors = {};
    if (!identifier.trim()) errors.identifier = 'Email/No HP wajib diisi';
    if (!password) errors.password = 'Password wajib diisi';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { identifier, password });
      await loginWithToken(res.data.token, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email atau No HP"
        name="identifier"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        error={fieldErrors.identifier}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
      />
      <Button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>
    </form>
  );
}

function OtpLoginForm({ loading, setLoading, setError, loginWithToken, navigate }) {
  const [step, setStep] = useState('request');
  const [target, setTarget] = useState('');
  const [kodeOtp, setKodeOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [devHint, setDevHint] = useState('');

  async function handleRequest(e) {
    e.preventDefault();
    setError('');

    if (!target.trim() || !EMAIL_REGEX.test(target)) {
      setFieldErrors({ target: 'Masukkan email yang valid' });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await api.post('/auth/otp/request', { target });
      // Demo/tes: OTP dikembalikan di response (tidak ada email gateway asli).
      setDevHint(`Kode OTP (demo): ${res.data.kode_otp}`);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');

    if (!kodeOtp.trim()) {
      setFieldErrors({ kodeOtp: 'Kode OTP wajib diisi' });
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      const res = await api.post('/auth/otp/verify', { target, kode_otp: kodeOtp });
      await loginWithToken(res.data.token, res.data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verifikasi OTP gagal');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'request') {
    return (
      <form onSubmit={handleRequest}>
        <Input
          label="Email"
          name="target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          error={fieldErrors.target}
        />
        <Button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerify}>
      <p className="helper-text">Kode OTP dikirim ke {target}</p>
      {devHint && <p className="helper-text">{devHint}</p>}
      <Input
        label="Kode OTP"
        name="kodeOtp"
        value={kodeOtp}
        onChange={(e) => setKodeOtp(e.target.value)}
        error={fieldErrors.kodeOtp}
      />
      <Button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
      </Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setStep('request')}
        style={{ width: '100%', marginTop: 8 }}
      >
        Ganti Email
      </Button>
    </form>
  );
}
