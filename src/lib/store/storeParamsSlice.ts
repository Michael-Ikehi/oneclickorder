// storeParamsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoreDetailsBasic {
  id?: number;
  name?: string;
  logo?: string;
}

interface StoreParamsState {
  city: string | null;
  area: string | null;
  storeName: string | null;
  prevStoreName?: string | null;
  storeDetails?: StoreDetailsBasic | null;
}

const initialState: StoreParamsState = {
  city: null,
  area: null,
  storeName: null,
  prevStoreName: null,
  storeDetails: null,
};

const storeParamsSlice = createSlice({
  name: 'storeParams',
  initialState,
  reducers: {
    setStoreParams(state, action: PayloadAction<Omit<StoreParamsState, 'prevStoreName' | 'storeDetails'>>) {
      state.prevStoreName = state.storeName;
      state.city = action.payload.city;
      state.area = action.payload.area;
      state.storeName = action.payload.storeName;
    },
    setStoreDetails(state, action: PayloadAction<StoreDetailsBasic | null>) {
      state.storeDetails = action.payload;
    },
    clearStoreParams(state) {
      state.city = null;
      state.area = null;
      state.storeName = null;
      state.prevStoreName = null;
      state.storeDetails = null;
    },
  },
});

export const { setStoreParams, setStoreDetails, clearStoreParams } = storeParamsSlice.actions;
export default storeParamsSlice.reducer;
