import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, TextField, Button, Paper,
  MenuItem, CircularProgress, Alert, Switch, FormControlLabel
} from "@mui/material";
import { CloudUpload, Save } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { uploadImage } from "../Services/cloudinary";
import { useAuth } from "../Hooks/useAuth";
import { useTranslation } from "react-i18next";

const categories = [
  "Painting",
  "Digital Art",
  "Photography",
  "Sculpture",
  "Illustration",
  "Abstract",
  "Portrait",
  "Landscape",
  "Oil Painting",
  "Acrylic",
  "Watercolor",
  "Ink",
  "Pencil",
  "Charcoal",
  "Soft Pastel",
  "Oil Pastel",

  "Other",
];

const UploadArtwork = () => {
  const navigate    = useNavigate();
  const { user, isArtist } = useAuth();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: "", description: "", price: "",
    category: "", medium: "",
  });
  const [image, setImage]             = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [isAuction, setIsAuction]     = useState(false);
  const [startingBid, setStartingBid] = useState("");
  const [endTime, setEndTime]         = useState("");

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!image)   { setError("Please select an image"); return; }
    if (!formData.title || !formData.category) { setError("Please fill required fields"); return; }
    if (isAuction && (!startingBid || !endTime)) { setError("Please fill auction details"); return; }

    try {
      setLoading(true);
      const imageUrl = await uploadImage(image);

      await addDoc(collection(db, "artworks"), {
        title:       formData.title,
        description: formData.description,
        price:       isAuction ? parseFloat(startingBid) : parseFloat(formData.price),
        category:    formData.category,
        medium:      formData.medium,
        imageUrl,
        artistId:    user.uid,
        artistName:  user.displayName || "Anonymous",
        createdAt:   serverTimestamp(),

        isAuction:      isAuction,
        startingBid:    isAuction ? parseFloat(startingBid) : null,
        currentBid:     isAuction ? parseFloat(startingBid) : null,
        currentBidderId: null,
        currentBidderName: null,
        auctionEndTime: isAuction ? new Date(endTime).toISOString() : null,
        auctionEnded:   false,
      });

      navigate("/gallery");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isArtist) return (
    <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
      <Typography variant="h5" color="error">Access Denied: Artists only</Typography>
      <Button variant="contained" onClick={() => navigate("/")} sx={{ mt: 2 }}>Go Home</Button>
    </Container>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4, fontFamily: "'Playfair Display', serif" }}>
      {t("my_artworks.new artwork")}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider" }}>
        <form onSubmit={handleSubmit}>

          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Box
              component="label"
              sx={{
                border: "2px dashed", borderColor: "divider",
                borderRadius: 2, p: 4, cursor: "pointer", display: "block",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              {imagePreview ? (
                <Box component="img" src={imagePreview} alt="Preview"
                  sx={{ maxWidth: "100%", maxHeight: 300, borderRadius: 1 }} />
              ) : (
                <Box>
                  <CloudUpload sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary">{t("my_artworks.upload img")}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <TextField fullWidth label={t("my_artworks.title")} name="title"
            value={formData.title} onChange={handleChange} sx={{ mb: 3 }} required />

          <TextField fullWidth label={t("my_artworks.description")} name="description"
            value={formData.description} onChange={handleChange}
            multiline rows={3} sx={{ mb: 3 }} />

          <TextField fullWidth select label={t("my_artworks.category")} name="category"
            value={formData.category} onChange={handleChange} sx={{ mb: 3 }} required>
            {categories.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>

          <TextField fullWidth label={t("my_artworks.medium")} name="medium"
            placeholder="e.g., Oil on canvas, Digital, Watercolor"
            value={formData.medium} onChange={handleChange} sx={{ mb: 3 }} />

          <Paper sx={{ p: 2.5, mb: 3, bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isAuction}
                  onChange={(e) => setIsAuction(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography fontWeight={600}>🔨 {t("my_artworks.Auction Mode")}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("my_artworks.set_auction")}.
                  </Typography>
                </Box>
              }
            />

            {isAuction ? (
              <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="Starting Bid ($) *" type="number"
                  value={startingBid} onChange={(e) => setStartingBid(e.target.value)}
                  size="small" sx={{ flex: 1, minWidth: 150 }}
                  inputProps={{ min: 1, step: 0.01 }}
                />
                <TextField
                  label="Auction End Date & Time *" type="datetime-local"
                  value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  size="small" sx={{ flex: 1, minWidth: 200 }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: new Date().toISOString().slice(0, 16) }}
                />
              </Box>
            ) : (
              <TextField
                fullWidth label={t("my_artworks.price")} type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                sx={{ mt: 2 }} size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}
          </Paper>

          <Button
            type="submit" variant="contained" size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
            disabled={loading} fullWidth
          >
            {loading ? t("my_artworks.uploading"): t("my_artworks.upload")}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default UploadArtwork;