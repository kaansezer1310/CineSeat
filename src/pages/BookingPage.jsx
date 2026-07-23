import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import SeatMap from "../components/seats/SeatMap.jsx";
import { SEAT_STATUS, isSeatSelectable } from "../domain/seatStatus.js";
import {
    DEFAULT_TICKET_TYPE,
    TICKET_TYPE_LIST,
    getTicketTypeLabel,
    isValidTicketType,
} from "../domain/ticketType.js";
import movieService from "../services/movieService.js";
import { calcItemTotal, formatPrice } from "../services/pricing.js";
import seatService from "../services/seatService.js";
import sessionService from "../services/sessionService.js";
import useCart from "../hooks/useCart.js";

const emptySeatStatuses = {};

function removeTicketTypesForSeats(
    ticketTypesBySeatId,
    seatIdsToRemove
) {
    if (seatIdsToRemove.length === 0) {
        return ticketTypesBySeatId;
    }

    const nextTicketTypes = { ...ticketTypesBySeatId };

    seatIdsToRemove.forEach((seatId) => {
        delete nextTicketTypes[seatId];
    });

    return nextTicketTypes;
}

function BookingPage() {
    const { sessionId } = useParams();

    const navigate = useNavigate();

    const { dispatch } = useCart();

    const numericSessionId = Number(sessionId);

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [
        ticketTypesBySeatId,
        setTicketTypesBySeatId,
    ] = useState({});
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

            setTicketTypesBySeatId((currentTicketTypes) => {
                return removeTicketTypesForSeats(
                    currentTicketTypes,
                    newlyUnavailableSeats
                );
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

        const isAlreadySelected =
            selectedSeats.includes(seatId);

        if (isAlreadySelected) {
            setSelectedSeats((currentSelectedSeats) => {
                return currentSelectedSeats.filter(
                    (selectedSeatId) => {
                        return selectedSeatId !== seatId;
                    }
                );
            });

            setTicketTypesBySeatId((currentTicketTypes) => {
                return removeTicketTypesForSeats(
                    currentTicketTypes,
                    [seatId]
                );
            });

            return;
        }

        setSelectedSeats((currentSelectedSeats) => {
            return [...currentSelectedSeats, seatId];
        });

        setTicketTypesBySeatId((currentTicketTypes) => {
            return {
                ...currentTicketTypes,
                [seatId]:
                    currentTicketTypes[seatId] ??
                    DEFAULT_TICKET_TYPE,
            };
        });
    }

    function handleTicketTypeChange(seatId, ticketType) {
        if (!selectedSeats.includes(seatId)) {
            return;
        }

        if (!isValidTicketType(ticketType)) {
            return;
        }

        setTicketTypesBySeatId((currentTicketTypes) => {
            return {
                ...currentTicketTypes,
                [seatId]: ticketType,
            };
        });
    }

    function handleClearSelection() {
        setAvailabilityMessage("");
        setSelectedSeats([]);
        setTicketTypesBySeatId({});
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

        const seatsWithTicketTypes = stillSelectableSeats
            .map((seatId) => {
                const ticketType =
                    ticketTypesBySeatId[seatId];

                if (!isValidTicketType(ticketType)) {
                    return null;
                }

                return {
                    seatId,
                    ticketType,
                };
            })
            .filter(Boolean);

        if (seatsWithTicketTypes.length === 0) {
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
            seats: seatsWithTicketTypes,
            unitPrice: session.price,
        };

        dispatch({
            type: "ADD_TICKET",
            payload: ticket,
        });

        setSelectedSeats([]);
        setTicketTypesBySeatId({});

        navigate("/cart");
    }

    const selectedSeatCount = selectedSeats.length;

    // Bilet tipine göre fiyat farkını yansıtmak için sepetle aynı
    // fiyatlandırma mantığı (`calcItemTotal`) kullanılır; düz
    // `selectedSeatCount * session.price` çarpımı öğrenci/çocuk
    // indirimini yok sayardı.
    const totalPrice = session
        ? calcItemTotal({
              unitPrice: session.price,
              seats: selectedSeats.map((seatId) => {
                  return {
                      seatId,
                      ticketType:
                          ticketTypesBySeatId[seatId] ??
                          DEFAULT_TICKET_TYPE,
                  };
              }),
          })
        : 0;

    const hasSelectedSeats = selectedSeatCount > 0;

    const canAddToCart =
        hasSelectedSeats &&
        selectedSeats.every((seatId) => {
            return isValidTicketType(
                ticketTypesBySeatId[seatId]
            );
        });

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

                    {hasSelectedSeats && (
                        <div className="booking-ticket-types">
                            <span className="booking-ticket-types-heading">
                                Bilet tipi
                            </span>

                            <ul className="ticket-type-list">
                                {selectedSeats.map((seatId) => {
                                    const selectId =
                                        `booking-ticket-type-${seatId}`;
                                    const ticketType =
                                        ticketTypesBySeatId[
                                            seatId
                                        ] ?? DEFAULT_TICKET_TYPE;

                                    return (
                                        <li
                                            className="ticket-type-row"
                                            key={seatId}
                                        >
                                            <label htmlFor={selectId}>
                                                {seatId} koltuğu
                                                <span className="visually-hidden">
                                                    {" "}
                                                    bilet tipi
                                                </span>
                                            </label>

                                            <div className="ticket-type-select-wrap">
                                                <select
                                                    className="ticket-type-select"
                                                    id={selectId}
                                                    value={ticketType}
                                                    onChange={(event) => {
                                                        handleTicketTypeChange(
                                                            seatId,
                                                            event.target.value
                                                        );
                                                    }}
                                                >
                                                    {TICKET_TYPE_LIST.map(
                                                        (optionType) => {
                                                            return (
                                                                <option
                                                                    key={optionType}
                                                                    value={optionType}
                                                                >
                                                                    {getTicketTypeLabel(
                                                                        optionType
                                                                    )}
                                                                </option>
                                                            );
                                                        }
                                                    )}
                                                </select>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    <div className="booking-total">
                        <span>Toplam</span>
                        <strong>{formatPrice(totalPrice)} TL</strong>
                    </div>

                    <button
                        className="primary-button booking-action-button"
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
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
