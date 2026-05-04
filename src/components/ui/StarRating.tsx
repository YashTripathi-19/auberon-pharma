import React from "react";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({ rating, size = 16, showValue = false }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} size={size} className="fill-accent text-accent" />
      ))}
      {hasHalf && <StarHalf size={size} className="fill-accent text-accent" />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} className="text-gray-300" />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-muted font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
