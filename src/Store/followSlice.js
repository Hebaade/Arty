import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../Firebase/firestore";
import {
  collection, addDoc, deleteDoc,
  query, where, getDocs, doc
} from "firebase/firestore";

export const fetchFollowing = createAsyncThunk(
  "follow/fetchFollowing",
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(collection(db, "follows"), where("followerId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const followArtist = createAsyncThunk(
  "follow/follow",
  async ({ followerId, followerName, artistId, artistName }, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(collection(db, "follows"), {
        followerId, followerName, artistId, artistName,
      });
      return { id: docRef.id, followerId, followerName, artistId, artistName };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const unfollowArtist = createAsyncThunk(
  "follow/unfollow",
  async ({ followerId, artistId }, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "follows"),
        where("followerId", "==", followerId),
        where("artistId",   "==", artistId)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => await deleteDoc(doc(db, "follows", d.id)));
      return artistId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const followSlice = createSlice({
  name: "follow",
  initialState: { following: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowing.fulfilled, (state, action) => { state.following = action.payload; })
      .addCase(followArtist.fulfilled,   (state, action) => { state.following.push(action.payload); })
      .addCase(unfollowArtist.fulfilled, (state, action) => {
        state.following = state.following.filter((f) => f.artistId !== action.payload);
      });
  },
});

export const selectFollowingIds = (state) => new Set(state.follow.following.map((f) => f.artistId));
export default followSlice.reducer;