import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Container, Typography, Avatar, Card,
  CardContent, CardActionArea, Chip, CircularProgress,
  Alert, Button, Paper
} from "@mui/material";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { Palette, PersonAdd, PersonRemove } from "@mui/icons-material";
import { fetchFollowing, followArtist, unfollowArtist, selectFollowingIds } from "../Store/followSlice";
import { useAuth } from "../Hooks/useAuth";
import { useTranslation } from "react-i18next";

const ArtistProfile = () => {
  const { artistId } = useParams();
  const { t }        = useTranslation();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const { user }     = useAuth();

  const followingIds = useSelector(selectFollowingIds);
  const isFollowing  = followingIds.has(artistId);

  const [artist, setArtist]               = useState(null);
  const [artworks, setArtworks]           = useState([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistDoc = await getDoc(doc(db, "users", artistId));
        if (!artistDoc.exists()) { setError("Artist not found"); setLoading(false); return; }
        setArtist({ id: artistDoc.id, ...artistDoc.data() });

        const artworksQ  = query(collection(db, "artworks"), where("artistId", "==", artistId));
        const artSnap    = await getDocs(artworksQ);
        setArtworks(artSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const followersQ = query(collection(db, "follows"), where("artistId", "==", artistId));
        const followSnap = await getDocs(followersQ);
        setFollowersCount(followSnap.size);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [artistId]);

  useEffect(() => {
    if (user) dispatch(fetchFollowing(user.uid));
  }, [user, dispatch]);

  const handleFollow = () => {
    if (!user) { navigate("/login"); return; }
    if (isFollowing) {
      dispatch(unfollowArtist({ followerId: user.uid, artistId }));
      setFollowersCount((prev) => Math.max(prev - 1, 0));
    } else {
      dispatch(followArtist({
        followerId:   user.uid,
        followerName: user.displayName,
        artistId,
        artistName:   artist.displayName,
      }));
      setFollowersCount((prev) => prev + 1);
    }
  };

  const totalValue = artworks.reduce((sum, a) => sum + (a.price || 0), 0);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <CircularProgress />
    </Box>
  );

  if (error || !artist) return (
    <Container sx={{ py: 8 }}>
      <Alert severity="error">{error || "Something went wrong"}</Alert>
    </Container>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      <Box sx={{
        bgcolor: "background.paper",
        py: { xs: 4, md: 6 },
        borderBottom: "1px solid", borderColor: "divider",
      }}>
        <Container maxWidth="lg">
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "center", md: "center" },
            gap: 3,
          }}>

            <Avatar
              src={artist.photoURL}
              sx={{
                width: 100, height: 100, flexShrink: 0,
                bgcolor: "primary.main", fontSize: 36,
                border: "3px solid", borderColor: "primary.light",
              }}
            >
              {artist.displayName?.[0]?.toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="h4" fontWeight={800}
                sx={{ fontFamily: "'Playfair Display', serif" }}>
                {artist.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {artist.email}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap", justifyContent: { xs: "center", md: "flex-start" } }}>
                <Chip icon={<Palette />} label="Artist" size="small" color="primary" variant="outlined" />
                {user?.uid !== artistId && (
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    size="small"
                    startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                    onClick={handleFollow}
                    sx={{ textTransform: "none" }}
                  >
                    {isFollowing ? t("profile.unfollow") : t("profile.follow")}
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{
              display: "flex", gap: 2, flexWrap: "wrap",
              justifyContent: { xs: "center", md: "flex-end" },
              flexShrink: 0,
            }}>
              <Paper sx={{ p: 2, textAlign: "center", minWidth: 80, border: "1px solid", borderColor: "divider" }}>
                <Typography fontWeight={800} color="primary" variant="h6">{artworks.length}</Typography>
                <Typography variant="caption" color="text.secondary">{t("profile.artworks")}</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: "center", minWidth: 80, border: "1px solid", borderColor: "divider" }}>
                <Typography fontWeight={800} color="primary" variant="h6">{followersCount}</Typography>
                <Typography variant="caption" color="text.secondary">{t("profile.followers")}</Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: "center", minWidth: 100, border: "1px solid", borderColor: "divider" }}>
                <Typography fontWeight={800} color="primary" variant="h6">${totalValue.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">{t("profile.total_value")}</Typography>
              </Paper>
            </Box>

          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h5" fontWeight={700} mb={3}
          sx={{ fontFamily: "'Playfair Display', serif" }}>
          {t("profile.artworks_by")} {artist.displayName}
        </Typography>

        {artworks.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography fontSize={48} mb={2}>🎨</Typography>
            <Typography color="text.secondary">{t("profile.no_artworks")}</Typography>
          </Box>
        ) : (
          <Box sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 2,
          }}>
            {artworks.map((art) => (
              <Card key={art.id} sx={{
                borderRadius: 3, overflow: "hidden",
                border: "1px solid", borderColor: "divider",
                transition: "0.25s",
                "&:hover": { transform: "translateY(-6px)", boxShadow: "0 12px 28px rgba(0,0,0,0.12)" },
              }}>
                <CardActionArea onClick={() => navigate(`/artwork/${art.id}`)}>
                  <Box
                    component="img" src={art.imageUrl} alt={art.title}
                    sx={{ width: "100%", height: 200, objectFit: "cover",
                      transition: "0.3s", "&:hover": { transform: "scale(1.05)" } }}
                  />
                  <CardContent>
                    <Typography fontWeight={700} noWrap
                      sx={{ fontFamily: "'Playfair Display', serif" }}>
                      {art.title}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                      <Typography fontWeight={800} color="primary">${art.price}</Typography>
                      {art.category && <Chip size="small" label={art.category} variant="outlined" />}
                    </Box>
                    {art.isAuction && (
                      <Chip label="🔨 Auction" size="small" color="warning" sx={{ mt: 1 }} />
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ArtistProfile;