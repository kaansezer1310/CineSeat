import apiClient from "./apiClient.js";
import {
  fromApiTicketType,
  toApiTicketType,
} from "../domain/ticketType.js";

// Rezervasyonlar artık veritabanında. (Önceden `localStorage` anahtarında
// tutuluyorlardı: kullanıcı bilet aldığını sanıyor, farklı bir tarayıcıdan
// girince rezervasyon kayboluyor, iki kişi aynı koltuğu alabiliyordu.)
//
// Backend rezervasyon başına TEK seans kabul ediyor. Sepet birden fazla
// seans içerebildiği için her sepet öğesi ayrı bir rezervasyona dönüşür.

function mapTicketDto(dto) {
  return {
    id: dto.id,
    seatId: dto.seatId,
    ticketType: fromApiTicketType(dto.ticketType),
    price: Number(dto.price) || 0,
  };
}

function mapReservationDto(dto) {
  return {
    id: dto.id,
    resNo: dto.resNo,
    showtimeId: dto.showtimeId,
    campaignId: dto.campaignId ?? null,
    buyer: {
      firstName: dto.buyerFname,
      lastName: dto.buyerLname,
      email: dto.buyerEmail,
    },
    subtotal: Number(dto.subtotal) || 0,
    discount: Number(dto.discount) || 0,
    total: Number(dto.total) || 0,
    status: dto.status,
    tickets: (dto.tickets ?? []).map(mapTicketDto),
  };
}

function mapSummaryDto(dto) {
  return {
    id: dto.id,
    resNo: dto.resNo,
    showtimeId: dto.showtimeId,
    startDatetime: dto.showtimeStart,
    movieTitle: dto.movieTitle,
    ticketCount: dto.ticketCount,
    total: Number(dto.total) || 0,
    status: dto.status,
  };
}

function toCommand(item, buyer, campaignId) {
  return {
    showtimeId: item.sessionId,
    campaignId: campaignId ?? null,
    buyerFname: buyer.firstName,
    buyerLname: buyer.lastName,
    buyerEmail: buyer.email,
    seats: item.seats.map((seat) => ({
      seatId: seat.seatId,
      ticketType: toApiTicketType(seat.ticketType),
    })),
  };
}

/**
 * Sepetteki her seans için bir rezervasyon oluşturur.
 *
 * Tutar ve indirim İSTEMCİDEN GÖNDERİLMEZ — yalnızca `campaignId` gider,
 * hesabı backend yapar. Araya giren bir hatada, o ana kadar oluşturulmuş
 * rezervasyonlar iptal edilir; aksi hâlde kullanıcı ödemediği bir bileti
 * üzerinde bulurdu.
 */
async function createReservation({ cartItems, buyer, campaignId = null }) {
  const created = [];

  try {
    for (const item of cartItems) {
      const dto = await apiClient.post(
        "/reservations",
        toCommand(item, buyer, campaignId)
      );

      created.push(mapReservationDto(dto));
    }
  } catch (error) {
    await Promise.all(
      created.map((reservation) =>
        apiClient
          .post(`/reservations/${reservation.id}/cancel`)
          .catch(() => null)
      )
    );

    throw error;
  }

  return created;
}

/** Giriş yapmış kullanıcının kendi rezervasyonları. */
async function getMyReservations({ pageNumber = 1, pageSize = 50 } = {}) {
  const result = await apiClient.get(
    `/reservations/my?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );

  return {
    items: (result?.items ?? []).map(mapSummaryDto),
    totalCount: result?.totalCount ?? 0,
  };
}

/**
 * Tüm rezervasyonlar — `reservation.read` izni gerektirir.
 * Yönetim raporları bu ucu kullanır.
 */
async function getAllReservations({
  pageNumber = 1,
  pageSize = 100,
  from,
  to,
  movieId,
  status,
} = {}) {
  const params = new URLSearchParams({
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  if (from) params.set("from", from);
  if (to) params.set("to", to);
  if (movieId) params.set("movieId", String(movieId));
  if (status) params.set("status", status);

  const result = await apiClient.get(`/reservations?${params.toString()}`);

  return {
    items: (result?.items ?? []).map(mapSummaryDto),
    totalCount: result?.totalCount ?? 0,
  };
}

const reservationService = {
  createReservation,
  getMyReservations,
  getAllReservations,
};

export default reservationService;
