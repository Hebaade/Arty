import { useEffect, useState } from "react";
import {
  Container, Typography,
  Card, CardMedia,
  CardContent, CardActions, Button,
  Box, CircularProgress, Chip, Alert
} from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const MyCollection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const q = query(
          collection(db, "purchases"),
          where("collectorId", "==", user.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          purchasedAt:
            doc.data().purchasedAt?.toDate?.()?.toISOString() || null,
        }));

        setArtworks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchCollection();
  }, [user]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {t("collection.title")}
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {artworks.length} {t("gallery.artwork")}
            {artworks.length !== 1 ? t("gallery.s") : ""}{" "}
            {t("gallery.collected")}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate("/")}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            width: { xs: "100%", sm: "auto" }
          }}
        >
          {t("collection.browse")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {artworks.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography fontSize={48} mb={2}>🖼️</Typography>

          <Typography variant="h6" color="text.secondary" mb={2}>
            {t("collection.empty")}
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            {t("collection.empty_desc")}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ textTransform: "none" }}
          >
            {t("collection.explore")}
          </Button>
        </Box>
      ) : (

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 3,
            alignItems: "stretch"
          }}
        >
          {artworks.map((item) => (
            <Card
              key={item.id}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 2,
                overflow: "hidden",
                transition: "0.25s",

                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: 4
                }
              }}
            >
              <CardMedia
                component="img"
                height="220"
                image={item.imageUrl}
                alt={item.title}
                sx={{
                  objectFit: "cover"
                }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} noWrap>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {t("artwork.by")} {item.artistName || "Unknown Artist"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t("collection.paid")}:{" "}
                    <strong>${item.price}</strong>
                  </Typography>

                  {item.category && (
                    <Chip
                      label={item.category}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {item.purchasedAt && (
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    mt={1}
                    display="block"
                  >
                    🗓️ {new Date(item.purchasedAt).toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() =>
                    navigate(`/artwork/${item.artworkId}`)
                  }
                  sx={{ textTransform: "none" }}
                  fullWidth
                >
                  {t("collection.view")}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyCollection;