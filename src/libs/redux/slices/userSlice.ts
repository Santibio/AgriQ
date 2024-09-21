// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  avatar: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  avatar: "",
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.avatar = action.payload;
      state.isAuthenticated = true;
    },
    clearToken: (state) => {
      state.avatar = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setToken, clearToken } = userSlice.actions;

export default userSlice.reducer;
