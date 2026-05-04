import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtworks } from "../Store/artWorksSlice";
import {
  fetchFavorites, addFavorite,
  removeFavorite, selectFavoritesIds
} from "../Store/favoritesSlice";
import {
  Box, Typography, Card, CardActionArea, CardContent,
  Chip, Skeleton, Container, TextField, InputAdornment,
  MenuItem, Select, FormControl, InputLabel,
  IconButton, Tooltip
} from "@mui/material";
import { Search, Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../Hooks/useAuth";

const categories = [
  "All", 
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

const sortOptions = [
  { value: "newest",     label: "Newest" },
  { value: "oldest",     label: "Oldest" },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

const Gallery = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { user, isCollector } = useAuth();

  const { artworks, loading } = useSelector((state) => state.artworks);
  const favoritesIds          = useSelector(selectFavoritesIds);

  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy]     = useState("Oldest");

  useEffect(() => {
    dispatch(fetchArtworks());
  }, [dispatch]);

  useEffect(() => {
    if (user && isCollector) dispatch(fetchFavorites(user.uid));
  }, [user, isCollector, dispatch]);

  const toggleFavorite = (e, artwork) => {
    e.stopPropagation();
    if (!user || !isCollector) { navigate("/login"); return; }
    if (favoritesIds.has(artwork.id)) {
      dispatch(removeFavorite({ userId: user.uid, artworkId: artwork.id }));
    } else {
      dispatch(addFavorite({ userId: user.uid, artwork }));
    }
  };

  const filtered = artworks
    .filter((a) => {
      const matchSearch   = a.title?.toLowerCase().includes(search.toLowerCase()) ||
                            a.artistName?.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "All" || a.category === category;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest")     return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "oldest")     return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === "price_asc")  return (a.price || 0) - (b.price || 0);
      if (sortBy === "price_desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      <Box sx={{
        py: 6, textAlign: "center",
        bgcolor: "background.paper",
        borderBottom: "1px solid", borderColor: "divider",
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={800}
            sx={{ fontFamily: "'Playfair Display', serif" }}>
            {t("gallery.title")}
          </Typography>
          <Typography color="text.secondary" mt={1}>
            {t("gallery.subtitle")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 4, alignItems: "center" }}>
          <TextField
            placeholder={t("gallery.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 250, bgcolor: "background.paper", borderRadius: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180, bgcolor: "background.paper" }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{t(`categories.${c}`, c)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: "background.paper" }}>
            <InputLabel>{t("gallery.sort")}</InputLabel>
            <Select value={sortBy} label={t("gallery.sort")} onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{t(`sort.${o.value}`, o.label)}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography sx={{ ml: "auto", color: "text.secondary" }}>
            {filtered.length} {t("gallery.artwork")}
          </Typography>
        </Box>

        <Box sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 3,
        }}>
          {loading ? (
            [...Array(8)].map((_, i) => (
              <Box key={i}>
                <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
                <Skeleton width="70%" sx={{ mt: 1 }} />
                <Skeleton width="40%" />
              </Box>
            ))
          ) : filtered.length === 0 ? (
            <Box sx={{ gridColumn: "1/-1", textAlign: "center", py: 10 }}>
              <Typography fontSize={48} mb={2}>🔍</Typography>
              <Typography variant="h6" color="text.secondary">No artworks found</Typography>
            </Box>
          ) : (
            filtered.map((artwork) => (
              <Card
                key={artwork.id}
                sx={(theme) => ({
                  borderRadius: 3, overflow: "hidden",
                  transition: "0.3s", height: "100%",
                  display: "flex", flexDirection: "column",
                  border: "1px solid",
                  borderColor: theme.palette.mode === "light" ? "#E8D5C0" : "#3D2A18",
                  boxShadow: theme.palette.mode === "light"
                    ? "0 2px 8px rgba(44,24,16,0.06)"
                    : "0 2px 8px rgba(0,0,0,0.4)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: theme.palette.mode === "light"
                      ? "0 16px 40px rgba(44,24,16,0.12)"
                      : "0 16px 40px rgba(0,0,0,0.8)",
                  },
                })}
              >
                <Box sx={{ position: "relative" }}>
                  <CardActionArea onClick={() => navigate(`/artwork/${artwork.id}`)}>
                    <Box
                      component="img"
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      sx={{
                        height: 240, width: "100%", objectFit: "cover",
                        transition: "0.5s",
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                    />
                  </CardActionArea>

                  {artwork.isAuction && (
                    <Chip
                      label="🔨 Auction"
                      size="small"
                      color="warning"
                      sx={{
                        position: "absolute", top: 8, left: 8,
                        fontSize: 11, fontWeight: 700,
                      }}
                    />
                  )}

                  {isCollector && (
                    <Tooltip title={favoritesIds.has(artwork.id) ? "Remove from favorites" : "Add to favorites"}>
                      <IconButton
                        onClick={(e) => toggleFavorite(e, artwork)}
                        size="small"
                        sx={(theme) => ({
                          position: "absolute", top: 8, right: 8,
                          bgcolor: theme.palette.mode === "light"
                            ? "rgba(255,255,255,0.9)"
                            : "rgba(36,26,14,0.9)",
                          boxShadow: 1,
                          width: 32, height: 32,
                        })}
                      >
                        {favoritesIds.has(artwork.id)
                          ? <Favorite sx={{ fontSize: 16, color: "#e53935" }} />
                          : <FavoriteBorder sx={{ fontSize: 16, color: "text.secondary" }} />
                        }
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <CardActionArea onClick={() => navigate(`/artwork/${artwork.id}`)} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Typography fontWeight={700} noWrap
                      sx={{ fontFamily: "'Playfair Display', serif" }}>
                      {artwork.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {t("gallery.by")} {artwork.artistName || t("gallery.unknown")}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography fontWeight={800} color="primary">
                        ${artwork.price}
                      </Typography>
                      {artwork.category && (
                        <Chip
                          label={t(`categories.${artwork.category}`, artwork.category)}
                          size="small"
                          sx={{ bgcolor: "action.selected" }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Gallery;