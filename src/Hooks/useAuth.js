import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../Firebase/auth";
import { db } from "../Firebase/firestore";
import { setUser, setRole, logout } from "../Store/authSlice";

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) dispatch(setRole(userDoc.data().role));
        dispatch(setUser(userData));
      } else {
        dispatch(logout());
      }
    });
    return () => unsubscribe();
  }, [dispatch]);
};

export const useAuth = () => {
  const { user, role, loading } = useSelector((state) => state.auth);
  return {
    user, role, loading,
    isAdmin:     role === "admin",
    isArtist:    role === "artist",
    isCollector: role === "collector",
    isLoggedIn:  !!user,
  };
};