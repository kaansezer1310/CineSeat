import { useState, useEffect } from "react";

/**
 * Geri sayım.
 *
 * `initialSeconds` SONRADAN değişebilir: ödeme ekranında koltuk kilitleri
 * asenkron alınıyor, süre ancak kilit geldiğinde biliniyor. `useState` yalnızca
 * ilk değeri kullandığı için sayaç 0'da kalıyor ve kilit gelir gelmez
 * "süre doldu" tetikleniyordu — sepet temizlenip kullanıcı sepete geri
 * atılıyordu. Bu yüzden değer değiştiğinde sayaç yeniden kuruluyor.
 */
export default function useCountdown(initialSeconds, onComplete) {
  const [seconds, setSeconds] = useState(initialSeconds);

  // Render sırasında karşılaştırma: effect içinde setState yapmaya göre
  // fazladan bir render turu doğurmaz (bkz. react.dev "You Might Not Need an Effect").
  const [syncedInitial, setSyncedInitial] = useState(initialSeconds);

  if (initialSeconds !== syncedInitial) {
    setSyncedInitial(initialSeconds);
    setSeconds(initialSeconds);
  }

  useEffect(() => {
    if (seconds <= 0) {
      if (onComplete) {
        onComplete();
      }
      return;
    }

    const timerId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [seconds, onComplete]);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return { seconds, formatTime };
}
