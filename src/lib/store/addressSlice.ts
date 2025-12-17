import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedAddress {
  id?: number;
  name: string;
  address: string;
  phone: string;
  floor: string;
  street_number: string;
  house: string;
  address_type: string;
  latitude: number;
  longitude: number;
}

interface AddressState {
  selectedAddress: SelectedAddress | null;
}

const initialState: AddressState = {
  selectedAddress: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<SelectedAddress>) => {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress: (state) => {
      state.selectedAddress = null;
    },
  },
});

export const { setSelectedAddress, clearSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;
