import { useState } from "react";
import {
  Box, Button, Typography, Divider,
  TextField, Alert, CircularProgress, Paper
} from "@mui/material";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../Firebase/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleRegister = async () => {
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

      navigate("/choose-role");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });

      dispatch(setUser({
        uid: result.user.uid,
        email,
        displayName: name,
        photoURL: null,
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
      <Box sx={{ width: "100%", maxWidth: 440 }}>

        <Typography variant="h4" textAlign="center">Arty</Typography>

        <Paper sx={{ p: 3 }}>

          {error && <Alert severity="error">{error}</Alert>}

          <Button fullWidth variant="outlined" onClick={handleGoogleRegister} sx={{ mb: 2 }}>
            {t("auth.google")}
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={handleRegister}>
            <TextField fullWidth label={t("auth.full_name")}
              value={name} onChange={(e) => setName(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label={t("auth.email")}
              value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2 }} />

            <TextField fullWidth label={t("auth.password")} type="password"
              value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2 }} />

            <Button fullWidth variant="contained" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : t("auth.create_btn")}
            </Button>
          </Box>

          <Typography textAlign="center" mt={2}>
            <Link to="/login">{t("auth.sign_in_link")}</Link>
          </Typography>

        </Paper>
      </Box>
    </Box>
  );
};

export default Register;