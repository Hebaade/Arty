import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Avatar,
  Modal,
  Snackbar
} from "@mui/material";
import { Share, ArrowBack, ShoppingCart } from "@mui/icons-material";
import { doc, getDoc } from "firebase/firestore";
import db from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
const ArtworkDetail = () => {
  const theme = useTheme();

  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, isCollector } = useAuth();
  const { t } = useTranslation();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const [openZoom, setOpenZoom] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const docRef = doc(db, "artworks", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setArtwork({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Artwork not found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
  };

  const handleBuy = async () => {
    setPaying(true);
    setError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artworkId: artwork.id,
          title: artwork.title,
          price: artwork.price,
          imageUrl: artwork.imageUrl,
          artistName: artwork.artistName,
        }),
      });

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError("Something went wrong");
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !artwork) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate("/")} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 5,
        overflowX: "hidden" 
      }}
    >

      <Button
        startIcon={<ArrowBack  />}
        onClick={() => navigate("/gallery")}
        sx={{ mb: 3, textTransform: "none" }}
      >
        {t("details.back")}
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
          gap: 4,
          alignItems: "start",
          width: "100%", 
          maxWidth: "100%" 
        }}
      >

        <Box sx={{ width: "100%", overflow: "hidden" }}>
          <Box
            component="img"
            src={artwork.imageUrl}
            alt={artwork.title}
            onClick={() => setOpenZoom(true)}
            sx={{
              width: "100%",
              maxWidth: "100%", 
              display: "block",
              borderRadius: 4,
              boxShadow:
                theme.palette.mode === "dark"
                  ? "0 20px 60px rgba(0,0,0,0.6)"
                  : "0 20px 60px rgba(0,0,0,0.2)",
              cursor: "zoom-in",
              transition: "0.3s",
              "&:hover": { transform: "scale(1.01)" }
            }}
          />
        </Box>

        <Box
          sx={{
            width: "100%", 
            maxWidth: "100%",
            alignSelf: "start",

            p: 3,
            borderRadius: 4,

            backdropFilter: "blur(12px)",
            background:
              theme.palette.mode === "dark"
                ? "rgba(36,26,14,0.7)"
                : "rgba(255,255,255,0.7)",

            border: "1px solid",
            borderColor: "divider",

            boxShadow:
              theme.palette.mode === "dark"
                ? "0 10px 40px rgba(0,0,0,0.5)"
                : "0 10px 40px rgba(0,0,0,0.08)",

            position: { md: "sticky" },
            top: { md: 20 }
          }}
        >

          {artwork.category && (
            <Chip
              label={artwork.category}
              size="small"
              sx={{ mb: 2, borderRadius: 2 }}
            />
          )}

          <Typography variant="h4" fontWeight={800}>
            {artwork.title}
          </Typography>

          <Button
            startIcon={<Share />}
            onClick={handleShare}
            size="small"
            variant="outlined"
            sx={{ textTransform: "none", my: 2 }}
          >
            {t("details.share")}
          </Button>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              my: 2,
              cursor: "pointer"
            }}
            onClick={() => navigate(`/artist/${artwork.artistId}`)}
          >
            <Avatar sx={{ width: 28, height: 28 }}>
              {artwork.artistName?.[0]?.toUpperCase()}
            </Avatar>

            <Typography variant="body2" color="text.secondary">
              {t("artwork.by")}{" "}
              <b style={{ color: theme.palette.primary.main }}>
                {artwork.artistName}
              </b>
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 2 }}>
            {artwork.description || "No description available"}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h4" fontWeight={900} color="primary">
            ${artwork.price}
          </Typography>

          {!artwork.isAuction && (
            <Button
              fullWidth
              variant="contained"
              size="large"
              disabled={!isLoggedIn || !isCollector}
              onClick={handleBuy}
              startIcon={<ShoppingCart />}
              sx={{
                mt: 2,
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 700
              }}
            >
              {paying
                ? "Processing..."
                : `${t("details.buy")} — $${artwork.price}`}
            </Button>
          )}
        </Box>
      </Box>

      <Modal
        open={openZoom}
        onClose={() => setOpenZoom(false)}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(10px)"
        }}
      >
        <Box onClick={() => setOpenZoom(false)}>
          <Box
            component="img"
            src={artwork.imageUrl}
            alt={artwork.title}
            sx={{
              maxWidth: "95vw",
              maxHeight: "95vh",
              borderRadius: 2,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
            }}
          />
        </Box>
      </Modal>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={t("details.link copied")}
      />
    </Container>
   
  );
};

export default ArtworkDetail;