// Menu Comment
export interface MenuComment {
  id: number;
  menu_id: number;
  user: {
    id: number;
    name: string;
  };
  comment: string;
  is_reply: boolean;
  parent_id: number | null;
  replies?: MenuComment[];
  created_at: string;
  updated_at: string;
}

// Menu Media (images/videos for each menu)
export interface MenuMedia {
  id: number;
  menu_id: number;
  media_type: 'image' | 'video';
  cloudinary_public_id: string;
  media_url: string;
  thumbnail_url: string;
  file_size: number;
  mime_type: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Store Menu with items and media
export interface StoreMenuItem {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  discount: number;
  discount_type: string;
  category_id: number;
  menu_id: number;
  food_variations?: string;
  add_ons_data?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
  available_time_starts?: string;
  available_time_ends?: string;
  zone_currency?: {
    currency: string;
    currency_symbol: string;
  };
}

export interface StoreMenu {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  store_id: number;
  image: string | null;
  items_count: number;
  menu_media: MenuMedia[];
  items?: StoreMenuItem[];
}

// Full Store Details
export interface StoreDetails {
  id: number;
  name: string;
  slug: string;
  branch?: string;
  phone?: string;
  email?: string;
  logo: string;
  cover_photo?: string;
  address?: string;
  description?: string;
  image: string;
  zone_id: number;
  module_id?: number;
  minimum_order?: number;
  delivery_time?: string;
  avg_rating?: number;
  rating_count?: number;
  open?: number | boolean;
  delivery?: boolean;
  take_away?: boolean;
  active?: boolean;
  
  // City and Area data
  cityData?: {
    id: number;
    name: string;
    slug: string;
  };
  areaData?: {
    id: number;
    name: string;
    slug: string;
  };
  
  // Zone currency
  zone_currency?: {
    currency: string;
    currency_symbol: string;
  };
  
  // Menu structure
  store_menu?: StoreMenu[];
  
  // Items (flat list of all items)
  items?: StoreMenuItem[];
  
  // Coupons
  store_coupon_discount?: Array<{
    id: number;
    title: string;
    code: string;
    discount: number;
    discount_type: string;
    min_purchase: number;
    max_discount: number;
    description: string;
  }>;
}

export interface LoginRequest {
  phone: string;
  password: string;
}
export interface LoginResponse {
  token: string;
}
export interface SignUpRequest {
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  password: string;
  ref_code?: string;
  activity_type: string;
  ref_store: string;
}

export interface SignUpResponse {
  token: string;
}

export interface PaystackPaymentRequest {
  amount: number;
  email: string;
}
export interface PaystackPaymentAuthorizationData {
  authorization_url: string;
  access_code: string;
  reference: string;
  callback_url: string;
  host: string;
}

export interface PaystackInnerData {
  status: boolean;
  message: string;
  data: PaystackPaymentAuthorizationData;
}

export interface PaystackPaymentResponse {
  status: string;
  message: string;
  data: PaystackInnerData;
}

export interface PaystackVerifyRequest {
  reference: string;
}
export interface PaystackVerifyResponse {
  status: string;
  message: string;
  data: string;
}

export interface StripePaymentIntentRequest {
  amount: number;
}
export interface StripePaymentIntentResponse {
  intent_client_secret: string;
}
export interface StripePaymentSuccessRequest {
  paymentIntentId: string;
  status: string;
  message: string;
}
export interface StripeCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface SaveStripeCardResponse {
  card: StripeCard;
}

export interface SaveStripeCardRequest {
  source: string;
  cardInfo?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
}

export interface RemoveStripeCardRequest {
  cardId: string;
}
export interface UpdateDefaultPaymentMethodRequest {
  methodId: string;
}
export interface PaymentFailedRequest {
  reason: string;
}
export interface AddCustomerAddressRequest {
  address_type: 'House' | 'Apartment' | 'Office' | string;
  contact_person_number: string;
  contact_person_name: string;
  address: string;
  additional_address: string;
  latitude: number;
  longitude: number;
  zone_id: number;
  zone_ids: number[];
  road: string;
  house: string;
  floor: string;
  flat: string;
  post_code: string;
}
export interface ApiErrorItem {
  code: string;
  message: string;
}

export interface ApiErrorResponse {
  errors: ApiErrorItem[];
}

export interface CustomerAddress {
  address_type: 'House' | 'Apartment' | 'Office' | string;
  contact_person_number: string;
  contact_person_name: string;
  address: string;
  addresses: string;
  additional_address: string;
  latitude: number;
  longitude: number;
  zone_id: number;
  zone_ids: number[];
  road: string;
  house: string;
  floor: string;
  flat: string;
  post_code: string;
  detail_address: string;
  id: number;
}
export type GetCustomerAddressesResponse = {
  addresses: CustomerAddress[];
};
export interface ResetPasswordRequest {
  phone: string;
  reset_token: string;
  password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface CustomerInfo {
  id: string;
  f_name: string;
  l_name: string;
  email: string;
  phone: string;
  wallet_balance: number;
  user_currency_symbol: string;
  currency_code: string;
  // Add more fields based on actual API respons
}

export interface CustomerStripeCard {
  id: string;
  brand: string;
  country: string;
  exp_month: number;
  exp_year: number;
  last4: string;
  funding: string;
  name: string | null;
  address_city: string | null;
  address_country: string | null;
  address_line1: string | null;
  address_line2: string | null;
  address_state: string | null;
  address_zip: string | null;
  customer: string;
  cvc_check: string;
  fingerprint: string;
  metadata: string[];
  object: string;
  address_line1_check: string | null;
  address_zip_check: string | null;
  allow_redisplay: string;
  dynamic_last4: string | null;
  regulated_status: string;
  tokenization_method: string | null;
  wallet: string | null;
}

export interface GetStripeCardsResponse {
  success: boolean;
  cards: {
    object: string;
    data: StripeCard[];
    has_more: boolean;
    url: string;
  };
}

export interface PlaceOrderRequest {
  cart: string;
  coupon_discount_amount: number;
  distance: number;
  schedule_at: string | null;
  order_amount: number;
  order_note: string;
  order_type: 'delivery' | 'takeaway' | string;
  payment_method: string;
  coupon_code: string | null;
  store_id: number;
  delivery_charge: number;
  address: string;
  latitude: number;
  longitude: number;
  address_type: string;
  contact_person_name: string;
  contact_person_number: string;
  street_number: string;
  house: string;
  floor: string;
  discount_amount: number;
  tax_amount: number;
  receiver_details: null;
  store_tips: number | null;
  cutlery: number;
  unavailable_item_note: string | null;
  delivery_instruction: string | null;
  service_charge: number;
  partial_payment: number;
  wallet_credit: number;
  payment_method_id?: string | null;
  moduleId: number | null;
  zoneId: number;
}

export interface OrderInfo {
  id: number;
  user_id: number;
  order_amount: number;
  coupon_discount_amount: number;
  coupon_discount_title: string;
  payment_status: string;
  order_status: string;
  total_tax_amount: number;
  payment_method: string;
  transaction_reference: string | null;
  delivery_address_id: number | null;
  delivery_man_id: number | null;
  coupon_code: string | null;
  order_note: string | null;
  order_type: string;
  checked: number;
  store_id: number;
  created_at: string;
  updated_at: string;
  delivery_charge: number;
  schedule_at: string;
  callback: string | null;
  otp: string;
  pending: string;
  accepted: string | null;
  confirmed: string | null;
  processing: string | null;
  handover: string | null;
  picked_up: string | null;
  delivered: string | null;
  canceled: string | null;
  refund_requested: string | null;
  refunded: string | null;
  delivery_address: string;
  scheduled: number;
}

export interface Orders {
  id: number;
  user_id: number;
  order_amount: number;
  // Add other fields if needed
}

export interface PlaceOrderResponse {
  status?: string;
  message?: string;
  order: Orders;
}
// In apiTypes.ts
export type OrderStatus = 'ongoing' | 'delivered' | 'canceled';

export interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  buy_quantity: number;
  // Extend this as needed
  zone_currency?: {
    currency: string;
    currency_symbol: string;
  };
}

export interface Order {
  id: number;
  order_status: OrderStatus;
  order_amount: number;
  created_at: string;
  store: {
    name: string;
    items: OrderItem[];
  };
}

export interface GetCustomerOrdersResponse {
  total_size: number;
  limit: string;
  offset: string;
  orders: Order[];
}

export interface Coupon {
  id: number;
  title: string;
  code: string;
  start_date: string;
  expire_date: string;
  min_purchase: number;
  max_discount: number;
  discount: number;
  discount_type: 'percent' | 'amount';
  coupon_type: 'store_wise' | 'other_type';
  limit: number;
  status: number;
  created_at: string;
  updated_at: string;
  data: string;
  total_uses: number;
  module_id: number;
  created_by: string;
  customer_id: string;
  slug: string | null;
  store_id: number | null;
  per_miles: number;
  max_user_limit: number;
  description: string;
  default_delivery_fee: number;
  order_type: 'all' | 'delivery' | 'pickup';
  multiple_store_ids: number[] | null;
  is_show_home: 0 | 1;
  is_shared_partner: 0 | 1;
}
// Distance API Response Types

export interface DistanceElement {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export interface DistanceRow {
  elements: DistanceElement[];
}

export interface DistanceApiResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: DistanceRow[];
  status: string;
}

export interface DistanceApiParams {
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  mode: 'walking' | 'driving' | 'bicycling' | 'transit';
}

export type PaymentRequestError = {
  status: number;
  data: {
    errors: {
      code: string;
      message: string;
    }[];
  };
};

export interface RunningOrder {
  id: number;
  user_id: number;
  order_amount: number;
  coupon_discount_amount: number;
  coupon_discount_title: string;
  payment_status: string;
  order_status: string;
  total_tax_amount: number;
  payment_method: string;
  transaction_reference: string | null;
  delivery_address_id: number | null;
  delivery_man_id: number | null;
  coupon_code: string | null;
  order_note: string;
  order_type: string;
  checked: number;
  store_id: number;
  created_at: string;
  updated_at: string;
  delivery_charge: number;
  schedule_at: string;
  callback: string | null;
  otp: string;
  pending: string;
  accepted: string | null;
  confirmed: string | null;
  processing: string | null;
  handover: string | null;
  picked_up: string | null;
  delivered: string | null;
  canceled: string | null;
  refund_requested: string | null;
  refunded: string | null;
}

export interface GetRunningOrdersResponse {
  total_size: number;
  limit: string;
  offset: string;
  orders: RunningOrder[];
}

export interface CreateActivityLogRequest {
  activity: string;
}

export interface CreateActivityLogResponse {
  status: 'success';
  data: {
    user_type: 'customer';
    activity: string;
    id: number;
  };
}
export interface CustomerAddress {
  id: number;
  contact_person_name: string;
  contact_person_number: string;
  address: string;
  road: string;
  house: string;
  floor: string;
  flat: string;
  address_type: string;
  latitude: number;
  longitude: number;
}
export interface LoyaltyWalletsResponse {
  gbp_balance: number;
  ngn_balance: number;
}

// ============================================
// 3D Secure Payment Types (NEW)
// ============================================

/**
 * Setup Intent - Used to save cards with 3DS verification
 */
export interface CreateSetupIntentResponse {
  success: boolean;
  message: string;
  data: {
    setup_intent_id: string;
    client_secret: string;
    customer_id: string;
  };
}

/**
 * Payment Intent Request - For charging cards
 */
export interface Create3DSPaymentIntentRequest {
  amount: number;
  currency: string;
  setup_intent_id?: string; // Optional: pass this when using a saved card
}

/**
 * Payment Intent Response - Returns payment status
 */
export interface Create3DSPaymentIntentResponse {
  success: boolean;
  message: string;
  data: {
    client_secret: string;
    payment_intent_id: string;
    amount: number;
    currency: string;
    customer_id: string;
    payment_method_id: string | null;
    status: 
      | 'requires_payment_method' 
      | 'requires_confirmation' 
      | 'requires_action'  // 3DS required!
      | 'processing' 
      | 'succeeded' 
      | 'canceled';
    used_setup_intent: boolean;
  };
}