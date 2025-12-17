import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderTypeState {
  orderType: string;
  // schedule: string;
}

const initialState: OrderTypeState = {
  orderType: '',
  // schedule: '',
};

const orderTypeSlice = createSlice({
  name: 'orderType',
  initialState,
  reducers: {
    setOrderType(state, action: PayloadAction<string>) {
      state.orderType = action.payload;
    },
    // setSchedule(state, action: PayloadAction<string>) {
    //   state.schedule = action.payload;
    // },
    setOrderTypeAndSchedule(state, action: PayloadAction<{ orderType: string }>) {
      state.orderType = action.payload.orderType;
      // state.schedule = action.payload.schedule;
    },
    clearOrderType(state) {
      state.orderType = '';
    },
  },
});

export const { setOrderType, setOrderTypeAndSchedule, clearOrderType } = orderTypeSlice.actions;
export default orderTypeSlice.reducer;
