import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { api } from "../services/api";
import authReducer from "../services/authSlice";
import basketReducer from "./basketSlice";
import orderTypeReducer from "./orderTypeSlice";
import addressReducer from "./addressSlice";
import restaurantTipReducer from "./restaurantTipSlice";
import paymentMethodReducer from "./paymentMethodSlice";
import orderNoteReducer from "./orderNoteSlice";
import selectedCardReducer from "./selectedCardSlice";
import storeParamsReducer from "./storeParamsSlice";
import refetchReducer from './refetchSlice';
import loadingReducer from './loadingSlice';
import activityLogReducer from './activityLogSlice';
import couponReducer from './couponSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers, AnyAction } from 'redux';
import { ThunkDispatch } from '@reduxjs/toolkit';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: [api.reducerPath],
};

const appReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  basket: basketReducer,
  orderType: orderTypeReducer,
  address: addressReducer,
  restaurantTip: restaurantTipReducer,
  orderNote: orderNoteReducer,
  paymentMethod: paymentMethodReducer,
  selectedCard: selectedCardReducer,
  storeParams: storeParamsReducer,
  loading: loadingReducer,
  refetch: refetchReducer,
  activityLog: activityLogReducer,
  coupon: couponReducer,
});

// Strongly typed rootReducer
const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: AnyAction
): ReturnType<typeof appReducer> => {
  if (action.type === "RESET_APP") {
    const preservedStoreParams = state?.storeParams;
    state = {
      storeParams: preservedStoreParams,
    } as ReturnType<typeof appReducer>;
  }

  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunkDispatch = ThunkDispatch<RootState, undefined, AnyAction>;
