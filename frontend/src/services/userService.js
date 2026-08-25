import apiClient from "./apiClient.js";

// Kullanıcı ve rol yönetimi (`user.manage` izni gerekir).

function mapUserDto(dto) {
  return {
    id: dto.id,
    name: `${dto.name} ${dto.surname}`.trim(),
    firstName: dto.name,
    lastName: dto.surname,
    username: dto.username,
    email: dto.email,
    phone: dto.phoneNum ?? "",
    roleId: dto.roleId,
    roleName: dto.roleName,
    memberSince: dto.memberSince,
    reservationCount: dto.reservationCount,
  };
}

const userService = {
  async list({ search = "", roleId = "", pageNumber = 1, pageSize = 50 } = {}) {
    const params = new URLSearchParams({
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
    });

    if (search) params.set("search", search);
    if (roleId) params.set("roleId", String(roleId));

    const result = await apiClient.get(`/users?${params}`);

    return {
      items: (result?.items ?? []).map(mapUserDto),
      totalCount: result?.totalCount ?? 0,
    };
  },

  async listRoles() {
    const roles = await apiClient.get("/roles");
    return (roles ?? []).map((role) => ({ id: role.id, name: role.name }));
  },

  /** Rol değişimi yetki yükseltmesidir; backend kendi rolünü değiştirmeyi reddeder. */
  async changeRole(userId, roleId) {
    return apiClient.put(`/users/${userId}/role`, {
      userId: Number(userId),
      roleId: Number(roleId),
    });
  },
};

export default userService;
