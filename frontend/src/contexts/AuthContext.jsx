import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * TODO: implementasikan state auth global:
 * - Saat provider dimuat (useEffect), cek token di localStorage,
 *   lalu panggil GET /auth/me untuk ambil data user (lihat ../services/api).
 * - loginWithToken(token, userData): simpan token ke localStorage & set state user.
 * - logout(): hapus token dari localStorage & reset state user.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  function loginWithToken(token, userData) {
    // TODO: implementasikan
  }

  function logout() {
    // TODO: implementasikan
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
