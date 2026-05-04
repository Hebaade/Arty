import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import app from "./firebaseConfig";

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const facebookProvider = new FacebookAuthProvider();