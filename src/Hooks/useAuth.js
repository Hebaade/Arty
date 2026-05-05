import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../Firebase/auth";
import { db } from "../Firebase/firestore";
import { setUser, setRole, setLoading, logout } from "../Store/authSlice";

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const u          = result.user;
          const userDocRef = doc(db, "users", u.uid);
          const userDoc    = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid:         u.uid,
              displayName: u.displayName,
              email:       u.email,
              photoURL:    u.photoURL,
              role:        null,
              createdAt:   new Date().toISOString(),
            }, { merge: true });
          }
        }
      })
      .catch((err) => console.error("Redirect error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
        };
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists() && userDoc.data().role) {
            dispatch(setRole(userDoc.data().role));
          }
        } catch (err) {
          console.error("Error fetching role:", err);
        }
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