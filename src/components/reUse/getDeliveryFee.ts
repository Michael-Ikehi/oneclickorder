import { Currency, ZoneData } from '../landing-page/LandingPage';

export type Store = {
  self_delivery_system?: number;
  free_delivery?: boolean;
  self_delivery_fee?: string;
  minimum_shipping_charge?: number;
  maximum_shipping_charge?: number;
  estimated_delivery_fee?: {
    per_km_shipping_charge: number;
    minimum_shipping_charge: number;
  };
  zone_currency?: Currency;
  zone_data?: ZoneData;
};

export type Coupon = {
  coupon_type?: string;
  per_miles?: number;
  limit?: number;
  default_delivery_fee?: number;
  discount_type: 'percent' | 'amount';
  discount: number;
  min_purchase?: number;
  order_type?: string;
};

export function getCouponDeliveryFee(coupon: Coupon, distance: number): number {
  const perMiles = Math.max(coupon.per_miles ?? 1, 1);
  const adjustedDistance = Math.max(0, distance - (coupon.limit ?? 0));
  return adjustedDistance * ((coupon.default_delivery_fee ?? 0) / perMiles);
}

export function getDeliveryFee(
  store: Store | undefined,
  distance: number,
  coupon?: Coupon
): number {
  if (!store) return 0;

  if (store.self_delivery_system === 1 && store.free_delivery) return 0;

  // Determine if distance unit is in miles or km
  const isMiles = store.zone_data?.distance_in?.toLowerCase() === 'miles';
  const distanceInPreferredUnit = isMiles ? distance / 1609.34 : distance / 1000;

  const parsedFee = parseFloat(store.self_delivery_fee ?? '');
  const rate =
    store.self_delivery_system === 1 && !isNaN(parsedFee)
      ? parsedFee
      : (store.estimated_delivery_fee?.per_km_shipping_charge ?? 0);

  const minimum =
    store.self_delivery_system === 1
      ? (store.minimum_shipping_charge ?? 0)
      : (store.estimated_delivery_fee?.minimum_shipping_charge ?? 0);

  const maximum = store.self_delivery_system === 1 ? store.maximum_shipping_charge : undefined;

  // If coupon grants free delivery
  if (coupon?.coupon_type === 'free_delivery' || coupon?.coupon_type === 'store_free_delivery') {
    return Math.max(getCouponDeliveryFee(coupon, distanceInPreferredUnit), minimum);
  }
  const calculated = rate * distanceInPreferredUnit;

  if (maximum && maximum > 0) {
    return Math.min(maximum, Math.max(calculated, minimum));
  }

  return Math.max(calculated, minimum);
}
