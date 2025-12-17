import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type PaymentMethod = 'paystack' | 'card' | 'paypal' | null;

interface PaymentMethodState {
  selectedMethod: PaymentMethod;
}

const initialState: PaymentMethodState = {
  selectedMethod: null,
};

const paymentMethodSlice = createSlice({
  name: 'paymentMethod',
  initialState,
  reducers: {
    setPaymentMethod(state, action: PayloadAction<PaymentMethod>) {
      state.selectedMethod = action.payload;
    },
    clearPaymentMethod(state) {
      state.selectedMethod = null;
    },
  },
});

export const { setPaymentMethod, clearPaymentMethod } = paymentMethodSlice.actions;
export default paymentMethodSlice.reducer;
