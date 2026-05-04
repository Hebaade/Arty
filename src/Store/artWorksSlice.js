import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firestore";

const initialState = {
  artworks: [],
  loading: false,
  error: null,
};

export const fetchArtworks = createAsyncThunk(
  "artworks/fetchArtworks",
  async () => {
    const querySnapshot = await getDocs(collection(db, "artworks"));

    const data = querySnapshot.docs.map((doc) => {
      const docData = doc.data();

      const serialized = {};
      for (const [key, value] of Object.entries(docData)) {
        if (value && typeof value.toDate === "function") {
          serialized[key] = value.toDate().toISOString();
        } else {
          serialized[key] = value;
        }
      }

      return {
        id: doc.id,
        ...serialized,
      };
    });

    return data;
  }
);

const artworkSlice = createSlice({
  name: "artworks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtworks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtworks.fulfilled, (state, action) => {
        state.loading = false;
        state.artworks = action.payload;
      })
      .addCase(fetchArtworks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default artworkSlice.reducer;