import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RestaurantTipState {
  amount: number | null;
}

const initialState: RestaurantTipState = {
  amount: null,
};

const restaurantTipSlice = createSlice({
  name: 'restaurantTip',
  initialState,
  reducers: {
    setTipAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    clearTipAmount: (state) => {
      state.amount = null;
    },
  },
});

export const { setTipAmount, clearTipAmount } = restaurantTipSlice.actions;
export default restaurantTipSlice.reducer;
