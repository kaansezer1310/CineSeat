import seatService from "./seatService.js";

/**
 * Ödeme akışında alınan koltuk kilitlerinin kimlikleri.
 *
 * Ödeme ve ödeme-hatası ayrı rotalar; aradaki geçişte PaymentPage unmount
 * olduğu için kilit kimliklerini React state'inde taşımak mümkün değil.
 * sessionStorage sekme kapanınca da temizlendiğinden bu iş için doğru yer —
 * kilitler zaten sunucu tarafında süreyle sınırlı.
 */
const LOCK_STORAGE_KEY = "cineseat_seat_locks";

export function readStoredLockIds() {
  try {
    const raw = sessionStorage.getItem(LOCK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function storeLockIds(lockIds) {
  sessionStorage.setItem(LOCK_STORAGE_KEY, JSON.stringify(lockIds));
}

export function forgetStoredLocks() {
  sessionStorage.removeItem(LOCK_STORAGE_KEY);
}

/** Kayıtlı kilitleri sunucuda bırakır ve kaydı siler. */
export async function clearStoredLocks() {
  const lockIds = readStoredLockIds();
  forgetStoredLocks();
  await seatService.releaseLocks(lockIds);
}
