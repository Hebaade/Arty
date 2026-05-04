import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import artworkReducer from "./artWorksSlice";
import favoritesReducer from "./favoritesSlice";
import bidsReducer from "./bidsSlice";
import followReducer from "./followSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    artworks: artworkReducer,
    favorites: favoritesReducer,
    bids: bidsReducer,
    follow: followReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/setUser"],
        ignoredPaths: ["auth.user"],
      },
    }),
});

export default store;