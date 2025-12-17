'use client';
import { StoreDetails } from '../landing-page/LandingPage';
import OrderSummaryLogic from './OrderSummaryLogic';

export interface OrderSummaryProps {
  storeDetails: StoreDetails;
}

const OrderSummary = ({ storeDetails }: OrderSummaryProps) => {
  return <OrderSummaryLogic storeDetails={storeDetails} />;
};

export default OrderSummary;
