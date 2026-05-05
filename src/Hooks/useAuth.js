import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../Firebase/auth";
import { db } from "../Firebase/firestore";
import { setUser, setRole, setLoading, logout } from "../Store/authSlice";

export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid:         firebaseUser.uid,
          email:       firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL:    firebaseUser.photoURL,
        };

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc    = await getDoc(userDocRef);

          if (userDoc.exists()) {
            if (userDoc.data().role) {
              dispatch(setRole(userDoc.data().role));
            }
          } else {
            await setDoc(userDocRef, {
              uid:         firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email:       firebaseUser.email,
              photoURL:    firebaseUser.photoURL,
              role:        null,
              createdAt:   new Date().toISOString(),
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error fetching user:", err);
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