import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Container, Typography, TextField, Button, Paper,
  MenuItem, CircularProgress, Alert
} from "@mui/material";
import { CloudUpload, Save } from "@mui/icons-material";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

const EditArtwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isArtist } = useAuth();
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    medium: "",
  });

  const [oldImage, setOldImage] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const docRef = doc(db, "artworks", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.artistId !== user.uid) {
            setError("Not authorized to edit this artwork");
            return;
          }

          setFormData({
            title: data.title || "",
            description: data.description || "",
            price: data.price || "",
            category: data.category || "",
            medium: data.medium || "",
          });

          setOldImage(data.imageUrl);
        }
      } catch (err) {
        setError("Failed to load artwork");
      } finally {
        setFetching(false);
      }
    };

    fetchArtwork();
  }, [id, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      let imageUrl = oldImage;

      if (image) {
        imageUrl = await uploadImage(image);
      }

      await updateDoc(doc(db, "artworks", id), {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        medium: formData.medium,
        imageUrl,
        updatedAt: serverTimestamp(),
      });

      navigate("/my-artworks");
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isArtist) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography color="error">Access Denied</Typography>
      </Container>
    );
  }

  if (fetching) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
    {t("edit_artwork.title")}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>

          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Box component="label" sx={{
              border: "2px dashed #ccc",
              p: 4,
              display: "block",
              cursor: "pointer"
            }}>
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />

              {imagePreview ? (
                <img src={imagePreview} style={{ maxWidth: "100%" }} />
              ) : (
                oldImage && (
                  <img src={oldImage} style={{ maxWidth: "100%" }} />
                )
              )}

              <Typography sx={{ mt: 2 }}>
                {t("edit_artwork.change_image")}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            label={t("edit_artwork.fields.title")}
            name="title"
            value={formData.title}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label={t("edit_artwork.fields.description")}
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              fullWidth
              type="number"
              label={t("edit_artwork.fields.price")}
              name="price"
              value={formData.price}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              select
              label={t("edit_artwork.fields.category")}
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            fullWidth
            label={t("edit_artwork.fields.medium")}
            name="medium"
            value={formData.medium}
            onChange={handleChange}
            sx={{ mb: 4 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
          >
            {loading ? t("edit_artwork.saving") : t("edit_artwork.actions.update")}
          </Button>

        </form>
      </Paper>
    </Container>
  );
};

export default EditArtwork;