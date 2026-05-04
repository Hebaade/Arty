import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../Firebase/firestore";
import {
  collection, addDoc, deleteDoc,
  query, where, getDocs, doc
} from "firebase/firestore";


export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "favorites"),
        where("collectorId", "==", userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async ({ userId, artwork }, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, "favorites"), {
        collectorId: userId,
        artworkId:   artwork.id,
        title:       artwork.title,
        imageUrl:    artwork.imageUrl,
        artistName:  artwork.artistName,
        price:       artwork.price,
        category:    artwork.category || "Other",
      });
      return {
        id:          docRef.id,
        collectorId: userId,
        artworkId:   artwork.id,
        title:       artwork.title,
        imageUrl:    artwork.imageUrl,
        artistName:  artwork.artistName,
        price:       artwork.price,
        category:    artwork.category || "Other",
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async ({ userId, artworkId }, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "favorites"),
        where("collectorId", "==", userId),
        where("artworkId",   "==", artworkId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => await deleteDoc(doc(db, "favorites", d.id)));
      return artworkId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: {
    items:   [],
    loading: false,
    error:   null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchFavorites.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFavorites.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchFavorites.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      // add
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      // remove
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((f) => f.artworkId !== action.payload);
      });
  },
});

export const selectFavorites    = (state) => state.favorites.items;
export const selectFavoritesIds = (state) => new Set(state.favorites.items.map((f) => f.artworkId));
export const selectFavLoading   = (state) => state.favorites.loading;

export default favoritesSlice.reducer;