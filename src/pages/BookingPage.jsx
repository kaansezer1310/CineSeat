import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import SeatMap from "../components/seats/SeatMap.jsx";
import { SEAT_STATUS, isSeatSelectable } from "../domain/seatStatus.js";
import movieService from "../services/movieService.js";
import seatService from "../services/seatService.js";
import sessionService from "../services/sessionService.js";
import useCart from "../hooks/useCart.js";

const emptySeatStatuses = {};

function BookingPage() {
    const { sessionId } = useParams();

    const navigate = useNavigate();

    const { dispatch } = useCart();

    const numericSessionId = Number(sessionId);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [
        availabilityMessage,
        setAvailabilityMessage,
    ] = useState("");

    const {
        data: session,
        isLoading: isSessionLoading,
        error: sessionError,
    } = useQuery({
        queryKey: ["session", numericSessionId],
        queryFn: () => {
            return sessionService.getSessionById(
                numericSessionId
            );
        },
        staleTime: 60 * 1000,
    });

    const movieId = session?.movieId;

    const {
        data: movie,
        isLoading: isMovieLoading,
        error: movieError,
    } = useQuery({
        queryKey: ["movie", movieId],
        queryFn: () => {
            return movieService.getMovieById(movieId);
        },
        enabled: Boolean(movieId),
        staleTime: 5 * 60 * 1000,
    });

    // Koltukların yalnızca DOLU/GECICI_KILITLI (BOS dışındaki) durumları
    // servisten gelir; SECILI, aşağıda yerel `selectedSeats` seçimiyle
    // türetilir (bkz. `SeatMap`/`resolveDisplaySeatStatus`). Query key
    // önceki sürümle aynı tutulur çünkü `CartPage`, rezervasyon başarılı
    // olduğunda bu anahtarı geçersizleştirir (invalidate).
    const {
        data: seatStatusesData,
        isLoading: areSeatsLoading,
        isFetching: areSeatsFetching,
        error: seatsError,
        refetch: refetchSeats,
    } = useQuery({
        queryKey: ["reservedSeats", numericSessionId],
        queryFn: () => {
            return seatService.getSeatStatusesBySessionId(
                numericSessionId
            );
        },
        staleTime: 10 * 1000,
    });

    const seatStatuses =
        seatStatusesData ?? emptySeatStatuses;

    const [
        previousSeatStatuses,
        setPreviousSeatStatuses,
    ] = useState(seatStatuses);

    if (seatStatuses !== previousSeatStatuses) {
        setPreviousSeatStatuses(seatStatuses);

        const newlyUnavailableSeats = selectedSeats.filter(
            (seatId) => {
                const storedStatus =
                    seatStatuses[seatId] ?? SEAT_STATUS.BOS;

                return !isSeatSelectable(storedStatus);
            }
        );

        if (newlyUnavailableSeats.length === 0) {
            setAvailabilityMessage("");
        } else {
            setSelectedSeats((currentSelectedSeats) => {
                return currentSelectedSeats.filter((seatId) => {
                    const storedStatus =
                        seatStatuses[seatId] ?? SEAT_STATUS.BOS;

                    return isSeatSelectable(storedStatus);
                });
            });

            const seatDescription =
                newlyUnavailableSeats.length === 1
                    ? `${newlyUnavailableSeats[0]} numaralı koltuk`
                    : `${newlyUnavailableSeats.join(", ")} numaralı koltuklar`;

            setAvailabilityMessage(
                `${seatDescription} artık müsait olmadığı için seçiminden çıkarıldı.`
            );
        }
    }

    function handleSeatSelect(seatId) {
        const storedStatus =
            seatStatuses[seatId] ?? SEAT_STATUS.BOS;

        if (!isSeatSelectable(storedStatus)) {
            return;
        }

        setAvailabilityMessage("");

        setSelectedSeats((currentSelectedSeats) => {
            const isAlreadySelected =
                currentSelectedSeats.includes(seatId);

            if (isAlreadySelected) {
                return currentSelectedSeats.filter(
                    (selectedSeatId) => {
                        return selectedSeatId !== seatId;
                    }
                );
            }

            return [...currentSelectedSeats, seatId];
        });
    }

    function handleClearSelection() {
        setAvailabilityMessage("");
        setSelectedSeats([]);
    }

    function handleAddToCart() {
        if (!movie || !session) {
            return;
        }

        // Sepete eklenmeden hemen önce, seçim yapıldığından sonra
        // müsaitliği değişmiş olabilecek koltuklar son bir kez elenir;
        // servis tarafı zaten çakışmaları reddeder, ama arayüz de
        // müsait olmayan bir koltuğu sepete taşımamalıdır.
        const stillSelectableSeats = selectedSeats.filter(
            (seatId) => {
                const storedStatus =
                    seatStatuses[seatId] ?? SEAT_STATUS.BOS;

                return isSeatSelectable(storedStatus);
            }
        );

        if (stillSelectableSeats.length === 0) {
            return;
        }

        const ticket = {
            id: `session-${session.id}`,
            sessionId: session.id,
            movieId: movie.id,
            movieTitle: movie.title,
            date: session.date,
            time: session.time,
            hallName: session.hallName,
            seats: stillSelectableSeats,
            unitPrice: session.price,
        };

        dispatch({
            type: "ADD_TICKET",
            payload: ticket,
        });

        setSelectedSeats([]);

        navigate("/cart");
    }

    const selectedSeatCount = selectedSeats.length;

    const totalPrice = session
        ? selectedSeatCount * session.price
        : 0;

    const hasSelectedSeats = selectedSeatCount > 0;

    if (
        isSessionLoading ||
        isMovieLoading ||
        areSeatsLoading
    ) {
        return (
            <div className="temporary-panel">
                Salon ve koltuk bilgileri yükleniyor.
            </div>
        );
    }

    if (sessionError || movieError || seatsError) {
        const errorMessage =
            sessionError?.message ||
            movieError?.message ||
            seatsError?.message ||
            "Koltuk bilgileri alınamadı.";

                return (
            <section>
                <div className="page-heading">
                    <h1>Koltuk planı açılamadı</h1>
                    <p>{errorMessage}</p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="booking-heading">
                <div>
                    <Link
                        className="back-link"
                        to={`/movies/${movie.id}`}
                    >
                        ← Seanslara dön
                    </Link>

                    <h1>{movie.title}</h1>

                    <p className="booking-meta">
                        {session.date} · {session.time} ·{" "}
                        {session.hallName} · {session.price} TL / kişi
                    </p>
                </div>

                <button
                    className="refresh-button"
                    type="button"
                    onClick={() => refetchSeats()}
                    disabled={areSeatsFetching}
                >
                    {areSeatsFetching
                        ? "Yenileniyor..."
                        : "↻ Koltukları Yenile"}
                </button>
            </div>

            {availabilityMessage && (
                <p
                    className="booking-availability-status"
                    role="status"
                >
                    {availabilityMessage}
                </p>
            )}

            <div className="booking-layout">
                <SeatMap
                    totalSeats={session.totalSeats}
                    seatStatuses={seatStatuses}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                />

                <aside className="booking-summary">
                    <h2>Seçimin</h2>

                    <div className="booking-summary-row">
                        <span>Film</span>
                        <strong>{movie.title}</strong>
                    </div>

                    <div className="booking-summary-row">
                        <span>Seans</span>
                        <strong>
                            {session.date} · {session.time}
                        </strong>
                    </div>

                    <div className="booking-summary-row">
                        <span>Salon</span>
                        <strong>{session.hallName}</strong>
                    </div>

                    <div className="booking-summary-row">
                        <span>Koltuklar</span>

                        <strong>
                            {hasSelectedSeats
                                ? selectedSeats.join(", ")
                                : "Henüz seçilmedi"}
                        </strong>
                    </div>

                    <div className="booking-total">
                        <span>Toplam</span>
                        <strong>{totalPrice} TL</strong>
                    </div>

                    <button
                        className="primary-button booking-action-button"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!hasSelectedSeats}
                    >
                        Sepete Ekle
                    </button>

                    {hasSelectedSeats && (
                        <button
                            className="clear-selection-button"
                            type="button"
                            onClick={handleClearSelection}
                        >
                            Seçimi Temizle
                        </button>
                    )}
                </aside>
            </div>
        </section>
    );
}

export default BookingPage;
