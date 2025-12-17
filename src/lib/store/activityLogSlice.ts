import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActivityLogState {
  logs: string[];
}

const initialState: ActivityLogState = {
  logs: [],
};

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    logActivity: (state, action: PayloadAction<string>) => {
      state.logs.push(action.payload);
    },
    clearActivities: (state) => {
      state.logs = [];
    },
  },
});

export const { logActivity, clearActivities } = activityLogSlice.actions;
export default activityLogSlice.reducer;
