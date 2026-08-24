import apiClient from "./apiClient.js";

// Profil görüntüleme vardı ama düzenleme frontend'de hiç yoktu; değişiklikler
// yalnızca sessionStorage'a yazılıyor, sunucuya hiç ulaşmıyordu.

function mapProfileDto(dto) {
  return {
    id: dto.id,
    firstName: dto.name,
    lastName: dto.surname,
    name: `${dto.name} ${dto.surname}`.trim(),
    username: dto.username,
    email: dto.email,
    phone: dto.phoneNum ?? "",
    gender: dto.gender ?? "",
    role: dto.role,
    memberSince: dto.memberSince,
  };
}

async function getProfile() {
  return mapProfileDto(await apiClient.get("/profile"));
}

/**
 * Profili günceller. E-posta, kullanıcı adı ve rol BİLİNÇLİ OLARAK
 * gönderilmez — backend de kabul etmiyor (kimlik alanları ayrı bir doğrulama
 * akışı ister, rol değişimi yetki yükseltmedir).
 */
async function updateProfile({ firstName, lastName, phone, gender }) {
  await apiClient.put("/profile", {
    name: firstName,
    surname: lastName,
    phoneNum: phone || null,
    gender: gender || null,
  });

  return getProfile();
}

const profileService = {
  getProfile,
  updateProfile,
};

export default profileService;
