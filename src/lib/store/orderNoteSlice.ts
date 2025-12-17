import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderNoteState {
  note: string;
}

const initialState: OrderNoteState = {
  note: "",
};

const orderNoteSlice = createSlice({
  name: "orderNote",
  initialState,
  reducers: {
    setOrderNote: (state, action: PayloadAction<string>) => {
      state.note = action.payload;
    },
    clearOrderNote: (state) => {
      state.note = "";
    },
  },
});

export const { setOrderNote, clearOrderNote } = orderNoteSlice.actions;

export default orderNoteSlice.reducer;
