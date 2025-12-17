import React from "react";
import ReviewDetail from "./ReviewDetail";
import { StoreDetails } from '@/components/landing-page/LandingPage';

export interface ReviewProps {
  storeDetails: StoreDetails;
}

const Review= ({storeDetails}:ReviewProps) => {
  return (
    <div className="px-3">
      <ReviewDetail storeDetails={storeDetails} />
    </div>
  );
};

export default Review;
