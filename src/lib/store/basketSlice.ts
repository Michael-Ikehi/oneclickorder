import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BasketItem {
  id: number;
  key: string;
  name: string;
  price: number;
  totalPrice: number;
  quantity: number;
  image: string;
  freeQuantity?: number;
  variations?: Record<string, string[]>;
  is_buy_get_free?: boolean;
  variationPrice?: number;
  addons?: {
    id: number;
    name: string;
    price: number;
  }[];
}

interface BasketState {
  items: BasketItem[];
}

const initialState: BasketState = {
  items: [],
};

const basketSlice = createSlice({
  name: 'basket',
  initialState,
  reducers: {
    addToBasket: (state, action: PayloadAction<BasketItem>) => {
      const payload = action.payload;
      const isBuyGetFree = !!payload.is_buy_get_free;

      const existingItem = state.items.find((item) => item.key === payload.key);

      if (existingItem) {
        if (payload.quantity <= 0) {
          state.items = state.items.filter((item) => item.key !== payload.key);
          return;
        }

        const index = state.items.findIndex((item) => item.key === payload.key);
        if (index !== -1) {
          state.items[index] = {
            ...existingItem,
            ...payload,
            freeQuantity: isBuyGetFree ? payload.quantity : 0,
            is_buy_get_free: isBuyGetFree,
          };
        }
      } else {
        const initialQty = Math.max(payload.quantity, 1);
        state.items.push({
          ...payload,
          quantity: initialQty,
          freeQuantity: isBuyGetFree ? initialQty : 0,
          totalPrice: payload.totalPrice,
          is_buy_get_free: isBuyGetFree,
        });
      }
    },

    removeFromBasket: (state, action: PayloadAction<{ key: string }>) => {
      state.items = state.items.filter((item) => item.key !== action.payload.key);
    },

    clearBasket: (state) => {
      state.items = [];
    },
  },
});

export const { addToBasket, removeFromBasket, clearBasket } = basketSlice.actions;
export default basketSlice.reducer;
