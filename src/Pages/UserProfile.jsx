import { useState, useEffect } from "react";
import {
  Box, Container, Typography, Avatar, Button, Paper,
  TextField, Alert, CircularProgress, Divider, Chip
} from "@mui/material";
import { Edit, Save, Cancel, CameraAlt } from "@mui/icons-material";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "../Firebase/firestore";
import { auth } from "../Firebase/auth";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "../Store/authSlice";
import { useAuth } from "../Hooks/useAuth";
import { uploadImage } from "../Services/cloudinary";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
    const { t, i18n } = useTranslation();
  const { user, role } = useAuth();

  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [uploading, setUploading] = useState(false);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio]                 = useState("");
  const [website, setWebsite]         = useState("");
  const [location, setLocation]       = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setLocation(data.location || "");
        setDisplayName(data.displayName || user.displayName || "");
      }
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!displayName.trim()) { setError("Name is required"); return; }
    setLoading(true); setError(""); setSuccess("");

    try {
      await updateProfile(auth.currentUser, { displayName });

      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        bio,
        website,
        location,
        updatedAt: new Date().toISOString(),
      });

      dispatch(setUser({ ...user, displayName }));

      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true); setError("");

    try {
      const url = await uploadImage(file, (p) => console.log(p));

      await updateProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
      dispatch(setUser({ ...user, photoURL: url }));
      setSuccess("Photo updated!");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || "");
    setEditing(false);
    setError("");
  };

  if (!user) return null;

  const roleColor = role === "admin" ? "error" : role === "artist" ? "primary" : "secondary";
  const roleLabel = role === "admin" ? "Admin" : role === "artist" ? "Artist" : "Collector";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="sm">

        <Typography variant="h4" fontWeight={800} mb={4}
          sx={{ fontFamily: "'Playfair Display', serif", color: "primary.main" }}>
            {t("user_profile.my_profile")}
        </Typography>

        {error   && <Alert severity="error"   sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

        <Paper sx={{ p: 4, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>

            <Box sx={{ position: "relative" }}>
              <Avatar
                src={user.photoURL}
                sx={{
                  width: 90, height: 90,
                  bgcolor: "primary.main", fontSize: 32,
                  border: "3px solid", borderColor: "primary.light",
                }}
              >
                {user.displayName?.[0]?.toUpperCase()}
              </Avatar>

              <Box
                component="label"
                sx={{
                  position: "absolute", bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: "50%",
                  bgcolor: "primary.main", display: "flex",
                  alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
                {uploading
                  ? <CircularProgress size={14} sx={{ color: "white" }} />
                  : <CameraAlt sx={{ fontSize: 14, color: "white" }} />
                }
              </Box>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}
                sx={{ fontFamily: "'Playfair Display', serif" }}>
                {user.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {user.email}
              </Typography>
              <Chip label={roleLabel} size="small" color={roleColor} variant="outlined" />
            </Box>

            {!editing ? (
              <Button
                startIcon={<Edit />}
                variant="outlined" size="small"
                onClick={() => setEditing(true)}
                sx={{ textTransform: "none" }}
              >
                {t("user_profile.edit")}
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  startIcon={<Cancel />}
                  variant="outlined" size="small" color="inherit"
                  onClick={handleCancel}
                  sx={{ textTransform: "none" }}
                >
                    {t("user_profile.cancel")}
                </Button>
                <Button
                  startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Save />}
                  variant="contained" size="small"
                  onClick={handleSave} disabled={loading}
                  sx={{ textTransform: "none" }}
                >
                    {t("user_profile.save")}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        <Paper sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={3}
            sx={{ fontFamily: "'Playfair Display', serif" }}>
            {t("user_profile.profile_info")}
          </Typography>

          <TextField
            fullWidth label={t("user_profile.display_name")} value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!editing} size="small" sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label={t("user_profile.bio")} value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!editing} size="small" multiline rows={3}
            placeholder="Tell the world about yourself..."
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth label={t("user_profile.location")} value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={!editing} size="small" sx={{ mb: 2 }}
            placeholder="e.g., Cairo, Egypt"
          />

          <TextField
            fullWidth label={t("user_profile.website")} value={website}
            onChange={(e) => setWebsite(e.target.value)}
            disabled={!editing} size="small"
            placeholder="https://yourwebsite.com"
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={2}
            sx={{ fontFamily: "'Playfair Display', serif" }}>
            {t("user_profile.quick_links")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {role === "artist" && <>
              <Button variant="outlined" size="small" onClick={() => navigate("/artist/my-artworks")} sx={{ textTransform: "none" }}>🖼️ My Artworks</Button>
              <Button variant="outlined" size="small" onClick={() => navigate("/artist/earnings")}    sx={{ textTransform: "none" }}>💰 Earnings</Button>
              <Button variant="outlined" size="small" onClick={() => navigate("/artist/canvas")}      sx={{ textTransform: "none" }}>✏️ Canvas Editor</Button>
            </>}
            {role === "collector" && <>
              <Button variant="outlined" size="small" onClick={() => navigate("/collector/my-collection")} sx={{ textTransform: "none" }}>🗂️ My Collection</Button>
              <Button variant="outlined" size="small" onClick={() => navigate("/collector/favorites")}     sx={{ textTransform: "none" }}>❤️ Favorites</Button>
            </>}
            {role === "admin" && (
              <Button variant="outlined" size="small" onClick={() => navigate("/admin")} sx={{ textTransform: "none" }}>🛡️ Dashboard</Button>
            )}
          </Box>
        </Paper>

      </Container>
    </Box>
  );
};

export default UserProfile;