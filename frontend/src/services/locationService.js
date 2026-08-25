import { createAdminResource } from "./adminResource.js";

// Şehir, ilçe ve sinema yönetimi. Üçü de aynı CRUD desenini izliyor;
// aradaki tek fark alan adları ve üst kaynağa bağlılık.

export const cityResource = createAdminResource({
  basePath: "/cities",
  mapDto: (dto) => ({ id: dto.id, name: dto.cityName }),
  toCommand: (values) => ({ cityName: values.name.trim() }),
});

export const districtResource = createAdminResource({
  basePath: "/districts",
  mapDto: (dto) => ({
    id: dto.id,
    name: dto.districtName,
    cityId: dto.cityId,
  }),
  toCommand: (values) => ({
    districtName: values.name.trim(),
    cityId: Number(values.cityId),
  }),
});

export const cinemaResource = createAdminResource({
  basePath: "/cinemas",
  mapDto: (dto) => ({
    id: dto.id,
    name: dto.name,
    address: dto.address,
    latitude: Number(dto.latitude),
    longitude: Number(dto.longitude),
    districtId: dto.districtId,
  }),
  toCommand: (values) => ({
    name: values.name.trim(),
    address: values.address.trim(),
    latitude: Number(values.latitude),
    longitude: Number(values.longitude),
    districtId: Number(values.districtId),
  }),
});
