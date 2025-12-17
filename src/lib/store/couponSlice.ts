import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CouponData {
  code: string;
  discount: number;
  discount_type: 'percent' | 'amount';
  min_purchase?: number;
  order_type?: string;
}

interface CouponState {
  appliedCoupon: CouponData | null;
  error: string | null;
}

const initialState: CouponState = {
  appliedCoupon: null,
  error: null,
};

const couponSlice = createSlice({
  name: 'coupon',
  initialState,
  reducers: {
    setCoupon: (state, action: PayloadAction<CouponData>) => {
      state.appliedCoupon = action.payload;
      state.error = null;
    },
    setCouponError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearCoupon: (state) => {
      state.appliedCoupon = null;
      state.error = null;
    },
  },
});

export const { setCoupon, setCouponError, clearCoupon } = couponSlice.actions;
export default couponSlice.reducer;

