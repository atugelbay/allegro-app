import { createContext, useContext, useState, useEffect } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      return setReady(true);
    }

    // Проверяем токен только при первой загрузке
    fetch("http://localhost:8080/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        return r.ok ? r.json() : Promise.reject();
      })
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        // Если токен невалидный, очищаем localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      })
      .finally(() => {
        setReady(true);
      });
  }, []); // Запускается только один раз при монтировании

  const login = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    
    // Сразу загружаем данные пользователя после логина
    fetch("http://localhost:8080/me", {
      headers: { Authorization: `Bearer ${access}` },
    })
      .then((r) => {
        return r.ok ? r.json() : Promise.reject();
      })
      .then((userData) => {
        setUser(userData);
      })
      .catch(() => {
        console.error("Error fetching user after login");
        // Если новый токен тоже невалидный, очищаем
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
      });
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    window.location.reload();
  };

  return (
    <AuthCtx.Provider value={{ user, ready, login, logout, clearAuth }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
