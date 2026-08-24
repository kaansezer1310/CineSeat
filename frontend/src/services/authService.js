import apiClient from "./apiClient.js";

// Backend rolleri PascalCase döner ("Admin", "User"); mevcut frontend kodu
// (ProtectedRoute, RatingStars, PaymentPage) küçük harfli "admin"/"member"
// bekliyor. Eşleme burada, tek yerde yapılır.
function mapRole(backendRole) {
  return backendRole === "Admin" ? "admin" : "member";
}

// Backend'in { token, expiresAt, user: {...} } şeklindeki yanıtını,
// AuthProvider'ın zaten bildiği kullanıcı şekline çevirir. `token` alanı
// bilerek objenin içine gömülüyor — AuthProvider onu sessionStorage'a
// olduğu gibi yazıyor, apiClient da oradan okuyup Authorization header'ına
// koyuyor. Böylece AuthProvider.jsx'e hiç dokunmadan token akışı çalışıyor.
function mapAuthResult(authResult) {
  const { user, token } = authResult;

  return {
    id: user.id,
    firstName: user.name,
    lastName: user.surname,
    name: `${user.name} ${user.surname}`.trim(),
    username: user.username,
    email: user.email,
    phone: "",
    gender: "",
    role: mapRole(user.role),
    permissions: Array.isArray(user.permissions) ? user.permissions : [],
    token,
  };
}

export const authService = {
  login: async (email, password) => {
    const result = await apiClient.post("/auth/login", {
      usernameOrEmail: email,
      password,
    });
    return mapAuthResult(result);
  },

  register: async (data) => {
    const result = await apiClient.post("/auth/register", {
      name: data.firstName,
      surname: data.lastName,
      username: data.username,
      email: data.email,
      password: data.password,
      phoneNum: data.phone || null,
      gender: data.gender || null,
    });
    return mapAuthResult(result);
  },
};
