import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import useAuth from "../../hooks/useAuth.js";
import ratingService from "../../services/ratingService.js";

const STAR_VALUES = [1, 2, 3, 4, 5];

function RatingStars({ movieId }) {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const [hoveredStar, setHoveredStar] = useState(0);

  const { data: ratingSummary = { average: 0, count: 0 } } =
    useQuery({
      queryKey: ["movieRating", movieId],
      queryFn: () => ratingService.getMovieRating(movieId),
      staleTime: 30 * 1000,
    });

  const { data: userRating = null } = useQuery({
    queryKey: ["userRating", movieId, user?.id],
    queryFn: () => ratingService.getUserRating(movieId, user.id),
    enabled: role === "member",
    staleTime: 30 * 1000,
  });

  const submitRatingMutation = useMutation({
    mutationFn: (stars) =>
      ratingService.submitRating(movieId, user.id, stars),
    onSuccess: (updatedSummary) => {
      queryClient.setQueryData(
        ["movieRating", movieId],
        updatedSummary
      );
      queryClient.invalidateQueries({
        queryKey: ["userRating", movieId, user.id],
      });
    },
  });

  function handleStarClick(stars) {
    if (role !== "member" || submitRatingMutation.isPending) {
      return;
    }

    submitRatingMutation.mutate(stars);
  }

  const displayedStarCount =
    hoveredStar || userRating || Math.round(ratingSummary.average);

  return (
    <div className="rating-stars">
      <div className="rating-stars-row" aria-label="Film puanı">
        {STAR_VALUES.map((starValue) => {
          const isFilled = starValue <= displayedStarCount;

          return (
            <button
              key={starValue}
              type="button"
              className={
                isFilled
                  ? "rating-star rating-star-filled"
                  : "rating-star"
              }
              disabled={role !== "member"}
              aria-label={`${starValue} yıldız ver`}
              aria-pressed={starValue === userRating}
              onClick={() => handleStarClick(starValue)}
              onMouseEnter={() => {
                if (role === "member") {
                  setHoveredStar(starValue);
                }
              }}
              onMouseLeave={() => setHoveredStar(0)}
            >
              ★
            </button>
          );
        })}
      </div>

      <p className="rating-summary-text">
        {ratingSummary.count > 0
          ? `${ratingSummary.average.toFixed(1)} / 5 (${ratingSummary.count} oy)`
          : "Henüz puan verilmemiş"}
      </p>

      {role !== "member" && (
        <p className="rating-guest-hint">
          Puan vermek için giriş yapmalısın.
        </p>
      )}
    </div>
  );
}

export default RatingStars;
