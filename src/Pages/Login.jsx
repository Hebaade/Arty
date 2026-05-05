import { useState } from "react";
import {
  Box, Button, Typography, Divider,
  TextField, Alert, CircularProgress, Paper
} from "@mui/material";
import {
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth";
import { auth, googleProvider } from "../Firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;

      dispatch(setUser({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
      }));

      navigate("/");
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

      dispatch(setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      }));

      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Box sx={{ width: "100%", maxWidth: 440 }}>

        <Typography variant="h4" textAlign="center">Arty</Typography>

        <Paper sx={{ p: 3 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <Button fullWidth variant="outlined" onClick={handleGoogleLogin} sx={{ mb: 2 }}>
            {t("auth.google")}
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleEmailLogin}>
            <TextField fullWidth label={t("auth.email")}
              value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label={t("auth.password")} type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />

            <Button fullWidth variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : t("auth.sign_in")}
            </Button>
          </Box>

          <Typography textAlign="center" mt={2}>
            <Link to="/register">{t("auth.register")}</Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
};

export default Login;