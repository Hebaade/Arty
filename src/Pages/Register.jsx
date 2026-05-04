import { useState, useEffect } from "react";
import {
  Box, Button, Typography, Divider,
  TextField, Alert, CircularProgress, Paper
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, googleProvider } from "../Firebase/auth";
import { db } from "../Firebase/firestore";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const isLocalhost = window.location.hostname === "localhost";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createUserDoc = async (user) => {
    await setDoc(doc(db, "users", user.uid), {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || null,
      role: null,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));

        await createUserDoc(user);
        navigate("/choose-role");
      }
    });

    return () => unsub();
  }, []);

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    try {
      if (isLocalhost) {
        const result = await signInWithPopup(auth, googleProvider);
        await createUserDoc(result.user);
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(result.user, { displayName: name });
      await createUserDoc(result.user);

      dispatch(setUser({
        uid: result.user.uid,
        email,
        displayName: name,
        photoURL: null
      }));

      navigate("/choose-role");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: 440 }}>

        <Typography variant="h4" textAlign="center">Arty</Typography>

        <Paper sx={{ p: 3 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <Button fullWidth variant="outlined" onClick={handleGoogle} sx={{ mb: 2 }}>
            Google
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleRegister}>
            <TextField fullWidth label="Name" value={name}
              onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label="Password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />

            <Button fullWidth variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Create account"}
            </Button>
          </Box>

          <Typography textAlign="center" mt={2}>
            <Link to="/login">Login</Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
};

export default Register;