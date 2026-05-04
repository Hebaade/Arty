import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,    
    loading: true,
    error: null,
  },
  reducers: {
    setUser(state, action)  { state.user = action.payload; state.loading = false; },
    setRole(state, action)  { state.role = action.payload; },
    setLoading(state, action) { state.loading = action.payload; },
    logout(state) { state.user = null; state.role = null; state.loading = false; },
  },
});

export const { setUser, setRole, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;