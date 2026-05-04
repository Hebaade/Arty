import { useState } from "react";
import { Box, Typography, Paper, Button, CircularProgress, Alert } from "@mui/material";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { useDispatch } from "react-redux";
import { setRole } from "../Store/authSlice";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ChooseRole = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "artist",
      icon: "🎨",
      title: t("choose_role.roles.artist.title"),
      desc: t("choose_role.roles.artist.desc"),
    },
    {
      id: "collector",
      icon: "🖼️",
      title: t("choose_role.roles.collector.title"),
      desc: t("choose_role.roles.collector.desc"),
    },
  ];

  const handleConfirm = async () => {
    if (!selected || !user) return;

    setLoading(true);
    setError("");

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          role: selected,
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      dispatch(setRole(selected));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8, px: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>
        {t("choose_role.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={4}>
        {t("choose_role.subtitle")}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap", justifyContent: "center" }}>
        {roles.map((role) => (
          <Paper
            key={role.id}
            onClick={() => setSelected(role.id)}
            sx={{
              p: 4,
              width: 200,
              cursor: "pointer",
              textAlign: "center",
              borderRadius: 3,
              border: selected === role.id ? "2px solid #6C5CE7" : "1.5px solid #e0e0e0",
              boxShadow: selected === role.id ? "0 0 0 4px #6C5CE720" : "none",
              transition: "all .2s",
              "&:hover": { borderColor: "#6C5CE7" },
            }}
          >
            <Typography fontSize={48}>{role.icon}</Typography>
            <Typography fontWeight={700} mt={1}>
              {role.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {role.desc}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Button
        variant="contained"
        size="large"
        disabled={!selected || loading}
        onClick={handleConfirm}
        sx={{ px: 6, textTransform: "none", borderRadius: 2 }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : t("choose_role.confirm")}
      </Button>
    </Box>
  );
};

export default ChooseRole;