import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import SeatMap from "../components/seats/SeatMap.jsx";
import movieService from "../services/movieService.js";
import seatService from "../services/seatService.js";
import sessionService from "../services/sessionService.js";
import useCart from "../hooks/useCart.js";

const emptyReservedSeats = [];

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

    const {
        data: reservedSeatsData,
        isLoading: areSeatsLoading,
        isFetching: areSeatsFetching,
        error: seatsError,
        refetch: refetchSeats,
    } = useQuery({
        queryKey: ["reservedSeats", numericSessionId],
        queryFn: () => {
            return seatService.getReservedSeatsBySessionId(
                numericSessionId
            );
        },
        staleTime: 10 * 1000,
    });

    const reservedSeats =
        reservedSeatsData ?? emptyReservedSeats;

    const [
        previousReservedSeats,
        setPreviousReservedSeats,
    ] = useState(reservedSeats);

    if (reservedSeats !== previousReservedSeats) {
        setPreviousReservedSeats(reservedSeats);

        const newlyReservedSeats = selectedSeats.filter(
            (seatId) => {
                return reservedSeats.includes(seatId);
            }
        );

        if (newlyReservedSeats.length === 0) {
            setAvailabilityMessage("");
        } else {
            setSelectedSeats((currentSelectedSeats) => {
                return currentSelectedSeats.filter((seatId) => {
                    return !reservedSeats.includes(seatId);
                });
            });

            const seatDescription =
                newlyReservedSeats.length === 1
                    ? `${newlyReservedSeats[0]} numaralı koltuk`
                    : `${newlyReservedSeats.join(", ")} numaralı koltuklar`;

            setAvailabilityMessage(
                `${seatDescription} artık müsait olmadığı için seçiminden çıkarıldı.`
            );
        }
    }

    function handleSeatSelect(seatId) {
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
        if (
            !movie ||
            !session ||
            selectedSeats.length === 0
        ) {
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
            seats: [...selectedSeats],
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
                    reservedSeats={reservedSeats}
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