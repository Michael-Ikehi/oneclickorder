import { StoreDetails } from '../LandingPage';

export interface BasketItem {
  id: number;
  key: string;
  name: string;
  price: number;
  totalPrice: number;
  quantity: number;
  image: string;
  discount?: number;
  freeQuantity?: number;
  is_buy_get_free?: boolean;
  variations?: Record<string, string[]>;
  variationPrice?: number;
  addons?: {
    id: number;
    name: string;
    price: number;
  }[];
}

export interface Props {
  item: BasketItem;
  storeDetails: StoreDetails;
}
