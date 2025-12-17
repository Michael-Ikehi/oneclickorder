import { createSlice } from '@reduxjs/toolkit';

interface RefetchState {
  refetchRunningOrders: boolean;
}

const initialState: RefetchState = {
  refetchRunningOrders: false,
};

const refetchSlice = createSlice({
  name: 'refetch',
  initialState,
  reducers: {
    triggerRefetch: (state) => {
      state.refetchRunningOrders = true;
    },
    resetRefetch: (state) => {
      state.refetchRunningOrders = false;
    },
  },
});

export const { triggerRefetch, resetRefetch } = refetchSlice.actions;
export default refetchSlice.reducer;
