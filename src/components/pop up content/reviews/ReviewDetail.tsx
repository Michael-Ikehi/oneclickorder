'use client';
import React, { useState } from 'react';
import { Star, User, ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewProps } from './Review';

export interface Review {
  id: number;
  store_id: number;
  rating: number; 
  comment: string;
  full_name: string;
  email: string;
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
  image?: string;
}

// Rating Bar Component
function RatingBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 font-medium" style={{ color: '#374151' }}>{rating}</span>
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <div className="flex-1 h-2 bg-secondary-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-xs" style={{ color: '#6b7280' }}>{count}</span>
    </div>
  );
}

// Stars Display Component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`
            ${sizeClasses[size]}
            ${star <= rating 
              ? 'text-amber-400 fill-amber-400' 
              : 'text-secondary-200'
            }
          `}
        />
      ))}
    </div>
  );
}

// Format date helper
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ReviewDetail = ({ storeDetails }: ReviewProps) => {
  const [visibleReviews, setVisibleReviews] = useState<number>(5);

  // Filter only approved reviews
  const reviews = (storeDetails?.reviews || []).filter(r => r.status === 'approved');

  // Calculate rating distribution
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalRating = 0;

  reviews.forEach((review) => {
    if (ratingCounts[review.rating] !== undefined) {
      ratingCounts[review.rating] += 1;
      totalRating += review.rating;
    }
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  const handleShowMore = () => setVisibleReviews((prev) => prev + 5);
  const handleShowLess = () => setVisibleReviews(5);

  if (totalReviews === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
          <Star className="w-8 h-8 text-secondary-400" />
        </div>
        <h3 className="font-medium text-secondary-900 mb-1">No reviews yet</h3>
        <p className="text-sm text-secondary-500">Be the first to review this store!</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Rating Summary Card */}
      <div className="bg-gradient-to-br from-secondary-900 to-secondary-800 rounded-xl p-5 text-white mb-6">
        <div className="flex items-center gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <p className="text-4xl font-bold" style={{ color: '#000000' }}>{averageRating.toFixed(1)}</p>
            <StarRating rating={Math.round(averageRating)} size="md" />
            <p className="text-sm mt-1" style={{ color: '#000000' }}>{totalReviews} reviews</p>
          </div>

          {/* Rating Bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 text-sm" style={{ color: '#000000' }}>
                <span className="w-3 text-secondary-300">{rating}</span>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.slice(0, visibleReviews).map((review, index) => (
          <article 
            key={review.id || index} 
            className="p-4 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                
              <div>
                  <h4 className="font-medium text-secondary-900 text-sm">
                    {review.full_name || 'Anonymous'}
                  </h4>
                  <p className="text-xs text-secondary-500">
                    {formatDate(review.created_at)}
                </p>
                </div>
              </div>
              
              <StarRating rating={review.rating} size="sm" />
            </div>

            {review.comment && (
              <p className="text-sm text-secondary-700 leading-relaxed">
                {review.comment}
              </p>
            )}
          </article>
              ))}
            </div>

      {/* Load More / Less Buttons */}
      <div className="flex justify-center gap-3 mt-6">
      {totalReviews > visibleReviews && (
        <button
          onClick={handleShowMore}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-50 rounded-lg transition-colors"
        >
            Show More
            <ChevronDown className="w-4 h-4" />
        </button>
      )}

        {visibleReviews > 5 && (
        <button
          onClick={handleShowLess}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
        >
            Show Less
            <ChevronUp className="w-4 h-4" />
        </button>
      )}
      </div>
    </div>
  );
};

export default ReviewDetail;
