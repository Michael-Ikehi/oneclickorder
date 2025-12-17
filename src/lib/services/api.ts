// lib/services/api.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import {
  AddCustomerAddressRequest,
  Coupon,
  Create3DSPaymentIntentRequest,
  Create3DSPaymentIntentResponse,
  CreateActivityLogRequest,
  CreateActivityLogResponse,
  CreateSetupIntentResponse,
  CustomerAddress,
  CustomerInfo,
  DistanceApiParams,
  DistanceApiResponse,
  GetCustomerAddressesResponse,
  GetCustomerOrdersResponse,
  GetRunningOrdersResponse,
  GetStripeCardsResponse,
  LoginRequest,
  LoginResponse,
  LoyaltyWalletsResponse,
  MenuComment,
  OrderInfo,
  PaymentFailedRequest,
  PaystackPaymentResponse,
  PaystackVerifyResponse,
  PlaceOrderRequest,
  PlaceOrderResponse,
  RemoveStripeCardRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SaveStripeCardRequest,
  SaveStripeCardResponse,
  SignUpRequest,
  SignUpResponse,
  StoreDetails,
  StripeCard,
  StripePaymentIntentResponse,
  StripePaymentSuccessRequest,
  UpdateDefaultPaymentMethodRequest,
} from './apiTypes';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('authorization', `Bearer ${token}`);
      headers.set('X-Localization', 'en');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    signUp: builder.mutation<SignUpResponse, SignUpRequest>({
      query: (userData) => ({
        url: '/auth/sign-up',
        method: 'POST',
        body: userData,
      }),
    }),

    getStoreDetails: builder.query<StoreDetails, string>({
      query: (storeName) => `/stores/details/${storeName}`,
    }),

    initiatePaystackPayment: builder.query<
      PaystackPaymentResponse,
      { orderId: number; host: string }
    >({
      query: ({ orderId, host }) => ({
        url: `/customer/paystack-initiate-payment/${orderId}?host=${encodeURIComponent(host)}`,
        method: 'GET',
      }),
    }),

    verifyPaystackPayment: builder.query<PaystackVerifyResponse, string>({
      query: (orderId) => ({
        url: `/customer/paystack-verify-payment/${orderId}`,
        method: 'GET',
      }),
    }),

    stripePaymentIntent: builder.query<
      StripePaymentIntentResponse,
      { orderId: number; host: string }
    >({
      query: ({ orderId, host }) => ({
        url: `/customer/stripe-payment-intent/${orderId}?apple_pay=false&host=${encodeURIComponent(host)}`,
        method: 'GET',
      }),
    }),

    stripePaymentSuccess: builder.query<StripePaymentSuccessRequest, string>({
      query: (orderId) => ({
        url: `/customer/stripe-payment-success/${orderId}`,
        method: 'GET',
      }),
    }),

    getStripeCards: builder.query<GetStripeCardsResponse, void>({
      query: () => '/customer/stripe/cards',
    }),

    saveStripeCard: builder.mutation<SaveStripeCardResponse, SaveStripeCardRequest>({
      query: (body) => ({
        url: '/customer/stripe/cards',
        method: 'POST',
        body,
      }),
    }),

    removeStripeCard: builder.mutation<void, RemoveStripeCardRequest>({
      query: ({ cardId }) => ({
        url: `/customer/stripe/cards/${cardId}`,
        method: 'DELETE',
      }),
    }),

    updateDefaultStripePaymentMethod: builder.mutation<void, UpdateDefaultPaymentMethodRequest>({
      query: (body) => ({
        url: '/customer/stripe/update-default-payment-method',
        method: 'PATCH',
        body,
      }),
    }),

    createStripeSetupIntent: builder.mutation<{ clientSecret: string }, void>({
      query: () => ({
        url: '/customer/stripe/setup',
        method: 'POST',
      }),
    }),

    // ============================================
    // 3D Secure Payment Endpoints (NEW)
    // ============================================

    /**
     * Create Setup Intent for saving cards with 3DS
     * Use this when adding a new card - it handles 3DS verification
     */
    create3DSSetupIntent: builder.mutation<CreateSetupIntentResponse, void>({
      query: () => ({
        url: '/customer/stripe/setup-intent',
        method: 'POST',
        body: {},
      }),
    }),

    /**
     * Create Payment Intent for charging cards with 3DS
     * - Without setup_intent_id: Customer enters card at checkout
     * - With setup_intent_id: Uses a previously saved card
     */
    create3DSPaymentIntent: builder.mutation<Create3DSPaymentIntentResponse, Create3DSPaymentIntentRequest>({
      query: (body) => ({
        url: '/customer/stripe/payment-intent',
        method: 'POST',
        body,
      }),
    }),

    paymentFailed: builder.mutation<void, PaymentFailedRequest>({
      query: (body) => ({
        url: '/customer/payment-failed/',
        method: 'POST',
        body,
      }),
    }),

    addCustomerAddress: builder.mutation<{ address: CustomerAddress }, AddCustomerAddressRequest>({
      query: (body) => ({
        url: '/customer/address/add',
        method: 'POST',
        body,
      }),
    }),

    getCustomerAddresses: builder.query<GetCustomerAddressesResponse, void>({
      query: () => ({
        url: '/customer/address/list',
        method: 'GET',
      }),
    }),

    deleteCustomerAddress: builder.mutation<void, string>({
      query: (addressId) => ({
        url: `/customer/address/delete?address_id=${addressId}`,
        method: 'DELETE',
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'PUT',
        body,
      }),
    }),
    forgotPassword: builder.mutation<void, { phone: string }>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    getCustomerInfo: builder.query<CustomerInfo, void>({
      query: () => ({
        url: '/customer/info',
        method: 'GET',
      }),
    }),

    getCustomerStripeCards: builder.query<StripeCard[], void>({
      query: () => '/customer/stripe/cards',
      transformResponse: (response: GetStripeCardsResponse) => response.cards.data,
    }),

    placeCustomerOrder: builder.mutation<PlaceOrderResponse, PlaceOrderRequest>({
      query: (body) => ({
        url: '/customer/order/place',
        method: 'POST',
        body,
      }),
    }),

    getCustomerOrders: builder.query<GetCustomerOrdersResponse, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: `/customer/order/list`,
        method: 'GET',
        params: { limit, offset },
      }),
    }),

    applyCoupon: builder.query<Coupon, { code: string; store_id: number; module_id: number }>({
      query: ({ code, store_id, module_id }) => ({
        url: `/coupon/apply`,
        method: 'GET',
        params: { code, store_id },
        headers: {
          ModuleId: String(module_id),
        },
      }),
    }),
    getDistanceData: builder.query<DistanceApiResponse, DistanceApiParams>({
      query: ({ origin_lat, origin_lng, destination_lat, destination_lng, mode }) => ({
        url: `/config/distance-api`,
        method: 'GET',
        params: {
          origin_lat,
          origin_lng,
          destination_lat,
          destination_lng,
          mode,
        },
      }),
    }),
    getCustomerOrderInfo: builder.query<OrderInfo, string>({
      query: (orderId) => ({
        url: `/customer/order/info/${orderId}`,
        method: 'GET',
      }),
    }),

    getRunningOrders: builder.query<GetRunningOrdersResponse, { limit: number; offset: number }>({
      query: ({ limit, offset }) => ({
        url: '/customer/order/running-orders',
        method: 'GET',
        params: { limit, offset },
      }),
    }),

    createActivityLog: builder.mutation<CreateActivityLogResponse, CreateActivityLogRequest>({
      query: (body) => ({
        url: '/activity-log/create',
        method: 'POST',
        body,
      }),
    }),

    getLoyaltyWallets: builder.query<LoyaltyWalletsResponse, void>({
      query: () => ({
        url: '/customer/loyalty/wallets',
        method: 'GET',
      }),
    }),

    // Menu Likes
    likeMenu: builder.mutation<{ status: boolean; message: string }, { menu_id: number }>({
      query: (body) => ({
        url: '/customer/menu/like',
        method: 'POST',
        body,
      }),
    }),

    unlikeMenu: builder.mutation<{ status: boolean; message: string }, { menu_id: number }>({
      query: (body) => ({
        url: '/customer/menu/unlike',
        method: 'POST',
        body,
      }),
    }),

    getMenuLikesCount: builder.query<
      { status: boolean; data: { menu_id: number; likes_count: number; is_liked: boolean } },
      number
    >({
      query: (menuId) => ({
        url: `/customer/menu/${menuId}/likes/count`,
        method: 'GET',
      }),
    }),

    // Menu Comments
    getMenuComments: builder.query<
      {
        status: boolean;
        data: {
          comments: MenuComment[];
          total_size: number;
          limit: number;
          offset: number;
        };
      },
      { menuId: number; limit?: number; offset?: number }
    >({
      query: ({ menuId, limit = 20, offset = 1 }) => ({
        url: `/customer/menu/${menuId}/comments`,
        method: 'GET',
        params: { limit, offset },
      }),
    }),

    addMenuComment: builder.mutation<
      { status: boolean; message: string; data: MenuComment },
      { menu_id: number; comment: string }
    >({
      query: (body) => ({
        url: '/customer/menu/comment',
        method: 'POST',
        body,
      }),
    }),

    replyToComment: builder.mutation<
      { status: boolean; message: string; data: MenuComment },
      { parent_id: number; comment: string }
    >({
      query: (body) => ({
        url: '/customer/menu/comment/reply',
        method: 'POST',
        body,
      }),
    }),

    updateComment: builder.mutation<
      { status: boolean; message: string; data: MenuComment },
      { commentId: number; comment: string }
    >({
      query: ({ commentId, comment }) => ({
        url: `/customer/menu/comment/${commentId}`,
        method: 'PUT',
        body: { comment },
      }),
    }),

    deleteComment: builder.mutation<
      { status: boolean; message: string },
      number
    >({
      query: (commentId) => ({
        url: `/customer/menu/comment/${commentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignUpMutation,
  useGetStoreDetailsQuery,
  useLazyInitiatePaystackPaymentQuery,
  useLazyVerifyPaystackPaymentQuery,
  useInitiatePaystackPaymentQuery,
  useVerifyPaystackPaymentQuery,
  useStripePaymentIntentQuery,
  useStripePaymentSuccessQuery,
  useLazyStripePaymentSuccessQuery,
  useGetCustomerOrderInfoQuery,
  useGetStripeCardsQuery,
  useSaveStripeCardMutation,
  useGetCustomerStripeCardsQuery,
  usePlaceCustomerOrderMutation,
  useRemoveStripeCardMutation,
  useUpdateDefaultStripePaymentMethodMutation,
  useCreateStripeSetupIntentMutation,
  usePaymentFailedMutation,
  useAddCustomerAddressMutation,
  useGetCustomerAddressesQuery,
  useDeleteCustomerAddressMutation,
  useResetPasswordMutation,
  useForgotPasswordMutation,
  useGetCustomerInfoQuery,
  useGetCustomerOrdersQuery,
  useLazyStripePaymentIntentQuery,
  useApplyCouponQuery,
  useLazyApplyCouponQuery,
  useGetDistanceDataQuery,
  useGetRunningOrdersQuery,
  useCreateActivityLogMutation,
  useGetLoyaltyWalletsQuery,
  // Menu Likes
  useLikeMenuMutation,
  useUnlikeMenuMutation,
  useGetMenuLikesCountQuery,
  // Menu Comments
  useGetMenuCommentsQuery,
  useAddMenuCommentMutation,
  useReplyToCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  // 3D Secure Payment (NEW)
  useCreate3DSSetupIntentMutation,
  useCreate3DSPaymentIntentMutation,
} = api;
