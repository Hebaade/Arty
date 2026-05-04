import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFavorites, removeFavorite, selectFavorites
} from "../Store/favoritesSlice";
import {
  Box, Container, Typography, Card, CardContent,
  CardActionArea, Chip, CircularProgress,
  Alert, IconButton, Tooltip
} from "@mui/material";
import { Favorite } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuth";
import { useTranslation } from "react-i18next";

const Favorites = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useAuth();
    const { t, i18n } = useTranslation();

  const favorites = useSelector(selectFavorites);
  const loading   = useSelector((state) => state.favorites.loading);
  const error     = useSelector((state) => state.favorites.error);

  useEffect(() => {
    if (user) dispatch(fetchFavorites(user.uid));
  }, [user, dispatch]);

  const handleRemove = (artworkId) => {
    dispatch(removeFavorite({ userId: user.uid, artworkId }));
  };

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      <Box sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid", borderColor: "divider",
        py: 5, textAlign: "center",
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={700} color="primary">
            {t("favorites.title")}
          </Typography>
          <Typography color="text.secondary" mt={1}>
            {favorites.length} {t("favorites.saved artworks")}{favorites.length !== 1 ? t("favorites.s") : ""}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 5 }}>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {favorites.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
           
            <Typography variant="h6" color="text.secondary" mb={1}>{t("favorites.empty")}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t("favorites.empty_desc")}
            </Typography>
          </Box>
        ) : (
          <div className="grid">
            {favorites.map((item) => (
              <Card key={item.id} className="card">
                <Box sx={{ position: "relative" }}>
                  <CardActionArea onClick={() => navigate(`/artwork/${item.artworkId}`)}>
                    <Box component="img" src={item.imageUrl} alt={item.title} className="image" />
                    <CardContent className="content">
                      <Typography className="title">{item.title}</Typography>
                      <Typography className="artist">by {item.artistName || "Unknown"}</Typography>
                      <Box className="bottom">
                        <Typography className="price">${item.price}</Typography>
                        {item.category && <Chip label={item.category} size="small" />}
                      </Box>
                    </CardContent>
                  </CardActionArea>

                  <Tooltip title="Remove from favorites">
                    <IconButton
                      onClick={() => handleRemove(item.artworkId)}
                      sx={{
                        position: "absolute", top: 8, right: 8,
                        bgcolor: "white", boxShadow: 1,
                        width: 34, height: 34,
                        "&:hover": { bgcolor: "white" },
                      }}
                    >
                      <Favorite sx={{ fontSize: 18, color: "#e53935" }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            ))}
          </div>
        )}
      </Container>

      <style>{`
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 18px; }
        .card { border-radius: 16px; overflow: hidden; border: 1px solid #eee; transition: 0.3s; }
        .card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.12); }
        .image { width: 100%; height: 240px; object-fit: cover; display: block; }
        .content { padding: 12px; }
        .title { font-weight: 700; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .artist { font-size: 13px; color: gray; margin-bottom: 10px; }
        .bottom { display: flex; justify-content: space-between; align-items: center; }
        .price { font-weight: 800; color: #8B5E3C; }
      `}</style>
    </Box>
  );
};

export default Favorites;