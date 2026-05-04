import { useState, useEffect } from "react";
import {
  Box, Button, Typography, Divider,
  TextField, Alert, CircularProgress, Paper
} from "@mui/material";
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider } from "../Firebase/auth";
import { db } from "../Firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser, setRole } from "../Store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const isLocalhost = window.location.hostname === "localhost";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAfterLogin = async (firebaseUser) => {
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };

    dispatch(setUser(userData));

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists() && userDoc.data().role) {
      dispatch(setRole(userDoc.data().role));
      navigate("/");
    } else {
      navigate("/choose-role");
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await handleAfterLogin(user);
      }
    });

    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLocalhost) {
        const result = await signInWithPopup(auth, googleProvider);
        await handleAfterLogin(result.user);
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handleAfterLogin(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: 440 }}>

        <Typography variant="h4" textAlign="center" mb={2}>
          Arty
        </Typography>

        <Paper sx={{ p: 3 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <Button fullWidth variant="outlined" onClick={handleGoogleLogin} sx={{ mb: 2 }}>
            Google
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleEmailLogin}>
            <TextField fullWidth label="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label="Password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />

            <Button fullWidth variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Login"}
            </Button>
          </Box>

          <Typography textAlign="center" mt={2}>
            <Link to="/register">Register</Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
};

export default Login;