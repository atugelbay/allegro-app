const API_URL = "http://localhost:8080";

export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(API_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    
    // Если получили 401 (Unauthorized) на авторизованном запросе, очищаем localStorage
    if (res.status === 401 && auth && !path.includes('/auth/')) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Перенаправляем на страницу логина только если не на страницах auth
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    throw new Error(txt || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// API функции для уроков
export async function getLessons() {
  return api("/lessons");
}

export async function getLesson(id) {
  return api(`/lessons/${id}`);
}

export async function updateProgress(exerciseId, status) {
  return api("/progress", {
    method: "POST",
    body: { exercise_id: exerciseId, status }
  });
}

export async function getUserProgress() {
  return api("/progress");
}