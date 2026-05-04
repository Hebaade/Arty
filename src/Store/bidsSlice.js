import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../Firebase/firestore";
import {
  collection, addDoc, query,
  where, getDocs, orderBy, doc, updateDoc
} from "firebase/firestore";

export const placeBid = createAsyncThunk(
  "bids/place",
  async ({ artworkId, amount, user }, { rejectWithValue }) => {
    try {
      await addDoc(collection(db, "bids"), {
        artworkId,
        bidderId:   user.uid,
        bidderName: user.displayName || "Anonymous",
        amount,
        createdAt:  new Date().toISOString(),
      });

      await updateDoc(doc(db, "artworks", artworkId), {
        currentBid:        amount,
        currentBidderId:   user.uid,
        currentBidderName: user.displayName || "Anonymous",
      });

      return { artworkId, amount, bidderId: user.uid, bidderName: user.displayName };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBids = createAsyncThunk(
  "bids/fetchForArtwork",
  async (artworkId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "bids"),
        where("artworkId", "==", artworkId),
        orderBy("amount", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const bidsSlice = createSlice({
  name: "bids",
  initialState: {
    bids:    [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearBids: (state) => { state.bids = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBids.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchBids.fulfilled, (state, action) => { state.loading = false; state.bids = action.payload; })
      .addCase(fetchBids.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(placeBid.fulfilled,  (state, action) => {
        state.bids.unshift({
          artworkId:  action.payload.artworkId,
          amount:     action.payload.amount,
          bidderId:   action.payload.bidderId,
          bidderName: action.payload.bidderName,
        });
      });
  },
});

export const { clearBids } = bidsSlice.actions;
export default bidsSlice.reducer;