import {
  ApiError,
  NotFoundError,
  ConflictError,
  ValidationError,
  ForbiddenError,
} from "./errors.js";

// Backend'in gerçek adresi. Vite ortam değişkeniyle geçersiz kılınabilir
// (frontend/.env.local içinde VITE_API_BASE_URL=... tanımlanarak) — tanımlı
// değilse geliştirme ortamındaki varsayılan backend portuna düşer.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5207/api";

const USER_STORAGE_KEY = "cineseat_user";

// authService.login/register, backend token'ını user nesnesinin içine
// (`token` alanı) gömerek sessionStorage'a yazıyor — bu fonksiyon onu
// AuthProvider'a hiç dokunmadan geri okur.
function getStoredToken() {
  const raw = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

// Backend'in ExceptionHandlingMiddleware'i her hatada tutarlı bir JSON
// gövdesi döner: { title, status, detail } veya { title, status, errors }
// (doğrulama hataları için, alan -> mesaj listesi). Bu fonksiyon o gövdeyi
// frontend'in zaten kullandığı hata sınıflarına (errors.js) çevirir —
// böylece LoginPage/RegisterPage gibi sayfalar `err.message`'ı hiç
// değişmeden okumaya devam eder.
async function toApiError(response) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Gövde yoksa (ör. 204 No Content sonrası bir hata) sessizce geç.
  }

  const message =
    body?.detail ||
    body?.title ||
    (body?.errors
      ? Object.values(body.errors).flat().join(" ")
      : null) ||
    "Beklenmeyen bir hata oluştu.";

  switch (response.status) {
    case 400:
    case 422:
      return new ValidationError(message);
    case 401:
      return new ApiError(message, { status: 401, code: "UNAUTHORIZED" });
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 409:
      return new ConflictError(message);
    default:
      return new ApiError(message, { status: response.status });
  }
}

// Tüm servislerin kullandığı tek giriş noktası. Base URL'i, Authorization
// header'ını (varsa token) ve hata çevirisini burada merkezi olarak yapar —
// hiçbir servis dosyası fetch/token detayını bilmek zorunda kalmaz.
async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new ApiError(
      "Sunucuya ulaşılamıyor. Backend çalışıyor mu kontrol edin.",
      { status: 0, code: "NETWORK_ERROR" }
    );
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiClient = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: "POST", body }),
  put: (path, body) => apiRequest(path, { method: "PUT", body }),
  del: (path) => apiRequest(path, { method: "DELETE" }),
};

export default apiClient;
