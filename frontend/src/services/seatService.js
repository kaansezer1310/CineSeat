import apiClient from "./apiClient.js";
import { formatSeatLabel, mapShowtimeSeatStatus } from "../domain/seat.js";

const DEFAULT_LOCK_MINUTES = 10;

/**
 * Seansın koltuk haritası. Tek uçtan gelir: salonun koltukları + her koltuğun
 * o seanstaki durumu. (Önceden koltuklar dosya içi sabit bir diziden
 * geliyordu ve `seatId` "A1" gibi uydurulmuş bir metindi.)
 *
 * Döner: { seats, statuses }
 *   seats    → [{ id, label, row, column, type }] — yalnızca kullanılabilir
 *              koltuklar; devre dışı koltuklar planda boşluk olarak kalır.
 *   statuses → { [seatId]: SEAT_STATUS }
 */
async function getShowtimeSeatMap(showtimeId) {
  const dtos = await apiClient.get(`/showtimes/${showtimeId}/seats`);

  const seats = [];
  const statuses = {};

  (dtos ?? []).forEach((dto) => {
    if (!dto.isActive) {
      return;
    }

    seats.push({
      id: dto.seatId,
      label: formatSeatLabel(dto.seatRow, dto.seatColumn),
      row: dto.seatRow,
      column: dto.seatColumn,
      type: dto.type,
    });

    statuses[dto.seatId] = mapShowtimeSeatStatus(
      dto.status,
      dto.lockedByCurrentUser
    );
  });

  return { seats, statuses };
}

/**
 * Seçilen koltukları kilitler.
 *
 * Backend toplu kilit almıyor, koltuk başına bir istek gerekiyor. Aradaki bir
 * koltuk başkasınca kapılırsa o ana kadar alınan kilitler geri bırakılır —
 * aksi hâlde kullanıcı hiç kullanmayacağı koltukları dakikalarca tutardı.
 */
async function lockSeats({
  showtimeId,
  seatIds,
  lockMinutes = DEFAULT_LOCK_MINUTES,
}) {
  const acquired = [];

  try {
    for (const seatId of seatIds) {
      const lock = await apiClient.post("/seatlocks", {
        showtimeId,
        seatId,
        lockMinutes,
      });

      acquired.push(lock);
    }
  } catch (error) {
    await releaseLocks(acquired.map((lock) => lock.id));
    throw error;
  }

  return acquired;
}

/** Seçimin tamamının kilit süresini tek istekte uzatır. */
async function renewLocks({
  showtimeId,
  seatIds,
  lockMinutes = DEFAULT_LOCK_MINUTES,
}) {
  return apiClient.post("/seatlocks/renew", {
    showtimeId,
    seatIds,
    lockMinutes,
  });
}

/**
 * Kilitleri bırakır. Temizlik işi olduğu için tek tek hatalar yutulur:
 * kilidin süresi zaten dolmuşsa ya da başkası devralmışsa kullanıcıya
 * gösterilecek bir şey yoktur, kilitler nasılsa kendiliğinden düşer.
 */
async function releaseLocks(lockIds = []) {
  await Promise.all(
    lockIds.map((lockId) =>
      apiClient.del(`/seatlocks/${lockId}`).catch(() => null)
    )
  );
}

const seatService = {
  getShowtimeSeatMap,
  lockSeats,
  renewLocks,
  releaseLocks,
  DEFAULT_LOCK_MINUTES,
};

export default seatService;
