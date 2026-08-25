import { TICKET_TYPE } from "../domain/ticketType.js";

/**
 * Bilet tipi carpanlari.
 *
 * BAGLAYICI DEGER BACKEND'DE: CreateReservationCommandHandler.TicketTypeMultiplier.
 * Buradaki kopya yalnizca on izleme icin var (her tusa basista sunucuya
 * sormak mumkun degil), bu yuzden ikisi birebir ayni olmak ZORUNDA.
 *
 * Cocuk carpani 0.60 yaziliydi, backend ise 0.50 uyguluyordu: kullanici
 * bir fiyat gorup baska tutar oduyordu.
 */
const TICKET_MULTIPLIERS = {
  [TICKET_TYPE.ADULT]: 1.0,
  [TICKET_TYPE.STUDENT]: 0.75,
  [TICKET_TYPE.CHILD]: 0.5,
};

export function calcItemTotal(item) {
  if (!item || !Array.isArray(item.seats)) return 0;
  
  return item.seats.reduce((total, seat) => {
    const multiplier = TICKET_MULTIPLIERS[seat.ticketType] ?? 1.0;
    return total + (item.unitPrice * multiplier);
  }, 0);
}

export function calcSubtotal(items) {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + calcItemTotal(item), 0);
}

export function formatPrice(amount) {
  return Number(amount).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
