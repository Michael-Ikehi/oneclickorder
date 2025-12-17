import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedCardState {
  cardId: string | null;
  // NEW: Store setup_intent_id for 3DS payments
  setupIntentId: string | null;
}

const initialState: SelectedCardState = {
  cardId: null,
  setupIntentId: null,
};

const selectedCardSlice = createSlice({
  name: "selectedCard",
  initialState,
  reducers: {
    setSelectedCard(state, action: PayloadAction<string>) {
      state.cardId = action.payload;
    },
    // NEW: Set both card ID and setup intent ID together
    setSelectedCardWithSetupIntent(state, action: PayloadAction<{ cardId: string; setupIntentId: string }>) {
      state.cardId = action.payload.cardId;
      state.setupIntentId = action.payload.setupIntentId;
    },
    // NEW: Set setup intent ID for the current card
    setSetupIntentId(state, action: PayloadAction<string>) {
      state.setupIntentId = action.payload;
    },
    clearSelectedCard(state) {
      state.cardId = null;
      state.setupIntentId = null;
    },
  },
});

export const { 
  setSelectedCard, 
  setSelectedCardWithSetupIntent,
  setSetupIntentId,
  clearSelectedCard 
} = selectedCardSlice.actions;
export default selectedCardSlice.reducer;
