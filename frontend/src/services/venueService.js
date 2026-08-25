import apiClient from "./apiClient.js";
import { createAdminResource } from "./adminResource.js";

// Salon, koltuk ve teknoloji yönetimi.

export const hallResource = createAdminResource({
  basePath: "/halls",
  mapDto: (dto) => ({
    id: dto.id,
    name: dto.name,
    cinemaId: dto.cinemaId,
  }),
  toCommand: (values) => ({
    name: values.name.trim(),
    cinemaId: Number(values.cinemaId),
  }),
});

export const technologyResource = createAdminResource({
  basePath: "/technologies",
  mapDto: (dto) => ({ id: dto.id, name: dto.name }),
  toCommand: (values) => ({ name: values.name.trim() }),
});

// Koltuklar tekil olarak oluşturulmuyor: salon için ızgara halinde toplu
// üretiliyor (`POST /seats/bulk`). Tek tek düzenleme yalnızca tip ve
// kullanılabilirlik için var.
export const seatService = {
  async getSeatMap(hallId) {
    const dtos = await apiClient.get(`/seats/map?hallId=${hallId}`);

    return (dtos ?? []).map((dto) => ({
      id: dto.id,
      row: dto.seatRow,
      column: dto.seatColumn,
      type: dto.type,
      isActive: dto.isActive,
    }));
  },

  async createGrid({ hallId, rowCount, columnCount, defaultType = "Regular" }) {
    return apiClient.post("/seats/bulk", {
      hallId: Number(hallId),
      rowCount: Number(rowCount),
      columnCount: Number(columnCount),
      defaultType,
    });
  },

  async updateSeat(seatId, { type, isActive }) {
    return apiClient.put(`/seats/${seatId}`, {
      id: Number(seatId),
      type,
      isActive,
    });
  },

  async removeSeat(seatId) {
    return apiClient.del(`/seats/${seatId}`);
  },
};

// Salon-teknoloji eşlemesi: ata / kaldır (güncelleme yok).
export const hallTechService = {
  async listByHall(hallId) {
    const dtos = await apiClient.get(`/halltechs?hallId=${hallId}`);

    return (dtos ?? []).map((dto) => ({
      id: dto.id,
      hallId: dto.hallId,
      technologyId: dto.technologyId,
      technologyName: dto.technologyName,
    }));
  },

  async assign(hallId, technologyId) {
    return apiClient.post("/halltechs", {
      hallId: Number(hallId),
      technologyId: Number(technologyId),
    });
  },

  async remove(hallTechId) {
    return apiClient.del(`/halltechs/${hallTechId}`);
  },
};
