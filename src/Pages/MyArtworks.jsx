import { useEffect, useState } from "react";
import {
  Container, Typography, Box, Button,
  CircularProgress, Chip, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, IconButton
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  collection, query, where, getDocs,
  deleteDoc, doc
} from "firebase/firestore";
import db from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Add, MoreVert } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const MyArtworks = () => {
  const { user } = useAuth();
    const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(
          collection(db, "artworks"),
          where("artistId", "==", user.uid)
        );
        const snap = await getDocs(q);
        setArtworks(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          }))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetch();
  }, [user]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "artworks", deleteId));
      setArtworks((prev) => prev.filter((a) => a.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h3">🎨 {t("my_artworks.titlee")}</Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate("/artist/upload")}
        >
          {t("my_artworks.upload")}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {artworks.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Typography color="text.secondary" mb={2}>
            You haven’t uploaded anything yet
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/artist/upload")}
          >
           {t("my_artworks.first artwork")}
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {artworks.map((artwork) => (
            <Box
              key={artwork.id}
              sx={{
                borderRadius: theme.shape.borderRadius * 2,
                overflow: "hidden",
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Box
                component="img"
                src={artwork.imageUrl}
                alt={artwork.title}
                onClick={() => navigate(`/artwork/${artwork.id}`)}
                sx={{
                  width: "100%",
                  height: 240,
                  objectFit: "cover",
                  cursor: "pointer",
                }}
              />

              <Box sx={{ p: 2 }}>

                <Typography fontWeight={600} noWrap>
                  {artwork.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                  noWrap
                >
                  {artwork.description || "No description"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography fontWeight={700} color="primary">
                    ${artwork.price}
                  </Typography>

                  {artwork.category && (
                    <Chip
                      label={artwork.category}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.background.default,
                      }}
                    />
                  )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={(e) => handleMenuOpen(e, artwork.id)}>
                    <MoreVert />
                  </IconButton>
                </Box>

              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(`/artwork/${selectedId}`);
            handleMenuClose();
          }}
        >
          {t("common.view")}
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate(`/edit-artwork/${selectedId}`);
            handleMenuClose();
          }}
        >
          {t("common.edit")}
        </MenuItem>

        <MenuItem
          onClick={() => {
            setDeleteId(selectedId);
            handleMenuClose();
          }}
          sx={{ color: "red" }}
        >
         {t("common.delete")}
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>{t("my_artworks.delete_confirm")}</DialogTitle>
        <DialogContent>
          <Typography>{t("my_artworks.delete_desc")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>
           {t("common.cancel")}
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : t("common.delete")}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default MyArtworks;