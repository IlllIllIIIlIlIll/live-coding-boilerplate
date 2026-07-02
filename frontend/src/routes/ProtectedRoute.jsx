import { useAuth } from '../contexts/AuthContext';

/**
 * TODO: bungkus halaman yang butuh login.
 * - Kalau belum login (user null) -> redirect ke /login (pakai <Navigate />)
 * - Kalau prop `roles` diisi dan role user tidak termasuk -> redirect (mis. ke /dashboard)
 * - Kalau lolos -> render children
 */
export default function ProtectedRoute({ children, roles }) {
  return children;
}
