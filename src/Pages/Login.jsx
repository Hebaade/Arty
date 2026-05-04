import { useState, useEffect } from "react";
import {
  Box, Button, Typography, Divider,
  TextField, Alert, CircularProgress, Paper
} from "@mui/material";
import {
  signInWithPopup, signInWithRedirect, getRedirectResult,
  signInWithEmailAndPassword, onAuthStateChanged
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
  const [redirectHandled, setRedirectHandled] = useState(false);

  const handleAfterLogin = async (firebaseUser) => {
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
    dispatch(setUser(userData));
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists() && userDoc.data().role) {
        dispatch(setRole(userDoc.data().role));
        navigate("/");
      } else {
        navigate("/choose-role");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (isLocalhost) {
      setRedirectHandled(true);
      return;
    }

    setLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) await handleAfterLogin(result.user);
      })
      .catch((err) => {
        if (err.code !== "auth/no-current-user") setError(err.message);
      })
      .finally(() => {
        setRedirectHandled(true);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!redirectHandled) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });

    return () => unsubscribe();
  }, [redirectHandled]);

  const handleGoogleLogin = async () => {
    setError(""); setLoading(true);
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
      if (isLocalhost) setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
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
    <Box sx={{
      minHeight: "100vh",
      bgcolor: "background.default",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      px: 2, py: 4,
    }}>
      <Box sx={{ width: "100%", maxWidth: 440 }}>

        <Typography
          variant="h4" fontWeight={800} textAlign="center" mb={1}
          sx={{ fontFamily: "'Playfair Display', serif", color: "primary.main", cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Arty
        </Typography>
        <Typography textAlign="center" color="text.secondary" mb={4} variant="body2">
          {t("auth.sign_in_subtitle")}
        </Typography>

        <Paper sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          border: "1px solid", borderColor: "divider",
          boxShadow: "0 4px 24px rgba(44,24,16,0.08)",
        }}>

          <Typography variant="h5" fontWeight={700} mb={0.5}
            sx={{ fontFamily: "'Playfair Display', serif" }}>
            {t("auth.welcome_back")}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("auth.sign_in_subtitle")}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Button
            fullWidth variant="outlined" size="large"
            onClick={handleGoogleLogin} disabled={loading}
            startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width={18} />}
            sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
          >
            {t("auth.google")}
          </Button>

          <Divider sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">or</Typography>
          </Divider>

          <Box component="form" onSubmit={handleEmailLogin}>
            <TextField
              fullWidth label={t("auth.email")} type="email" size="small"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 1.5 }} required
            />
            <TextField
              fullWidth label={t("auth.password")} type="password" size="small"
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2.5 }} required
            />
            <Button
              fullWidth variant="contained" type="submit"
              size="large" disabled={loading}
              sx={{ textTransform: "none", fontWeight: 700, py: 1.2 }}
            >
              {loading
                ? <CircularProgress size={22} color="inherit" />
                : t("auth.sign_in")
              }
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2.5, textAlign: "center" }}>
            {t("auth.no_account")}{" "}
            <Link to="/register" style={{ color: "#8B5E3C", fontWeight: 600 }}>
              {t("auth.register")}
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;