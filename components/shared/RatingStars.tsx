import type { ReactElement } from "react";
import { Star, StarHalf } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
}

function getStarType(
  rating: number,
  index: number,
): "full" | "half" | "empty" {
  const starValue = index + 1;

  if (rating >= starValue - 0.24) {
    return "full";
  }

  if (rating >= starValue - 0.74) {
    return "half";
  }

  return "empty";
}

export default function RatingStars({
  rating,
  reviewCount,
  showCount = false,
}: RatingStarsProps): ReactElement {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const starType = getStarType(rating, index);

          if (starType === "half") {
            return (
              <StarHalf
                key={`star-${index + 1}`}
                className="size-3.5 fill-gold text-gold"
              />
            );
          }

          return (
            <Star
              key={`star-${index + 1}`}
              className={cn(
                "size-3.5",
                starType === "full"
                  ? "fill-gold text-gold"
                  : "fill-transparent text-text-muted/40",
              )}
            />
          );
        })}
      </div>
      {showCount && reviewCount ? (
        <span className="font-dm-sans text-caption text-text-muted">
          ({reviewCount} reviews)
        </span>
      ) : null}
    </div>
  );
}
