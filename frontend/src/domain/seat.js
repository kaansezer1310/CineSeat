import { SEAT_STATUS } from "./seatStatus.js";

/**
 * Koltuk etiketi: satır numarası harfe, sütun numarası rakama dönüşür.
 * Backend koltukları (SeatRow, SeatColumn) çifti olarak tutuyor; "A5" yalnızca
 * bir GÖRÜNTÜLEME biçimi — kilit ve rezervasyon her zaman `seatId` ile yapılır.
 */
export function formatSeatLabel(row, column) {
  const safeRow = Number(row);
  const safeColumn = Number(column);

  if (!Number.isInteger(safeRow) || safeRow < 1) {
    return String(column ?? "");
  }

  // 1→A, 26→Z, 27→AA … 26'dan uzun salonlarda da çakışmasın.
  let label = "";
  let remaining = safeRow;

  while (remaining > 0) {
    const remainder = (remaining - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    remaining = Math.floor((remaining - 1) / 26);
  }

  return `${label}${safeColumn}`;
}

/**
 * Backend'in seans bazlı koltuk durumunu arayüzün durum modeline çevirir.
 *
 * Kullanıcının KENDİ kilidi "boş" sayılır: koltuğu tutan kişi odur, arayüzde
 * "başkası aldı" gibi görünmemeli — sayfayı yenilediğinde seçimini
 * sürdürebilmeli.
 */
export function mapShowtimeSeatStatus(status, lockedByCurrentUser = false) {
  if (status === "Reserved") {
    return SEAT_STATUS.DOLU;
  }

  if (status === "Locked") {
    return lockedByCurrentUser
      ? SEAT_STATUS.BOS
      : SEAT_STATUS.GECICI_KILITLI;
  }

  return SEAT_STATUS.BOS;
}
