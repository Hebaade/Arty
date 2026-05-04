import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  Chip,
  Paper,
  TextField
} from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Palette, Search } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

const Artists = () => {
  const theme = useTheme();

  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      const q = query(collection(db, "users"), where("role", "==", "artist"));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      setArtists(data);
      setFiltered(data);
      setLoading(false);
    };

    fetchArtists();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFiltered(
      artists.filter((a) =>
        a.displayName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
      )
    );
  }, [search, artists]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>

      <Box
        sx={{
          py: { xs: 6, md: 9 },
          textAlign: "center",
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #1A1208 0%, #241A0E 100%)"
              : "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight={900}>
            {t("artists.title")}
          </Typography>

          <Typography color="text.secondary" mt={1}>
            {t("artists.subtitle")}
          </Typography>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Paper
              elevation={0}
              sx={{
                p: "4px 10px",
                display: "flex",
                alignItems: "center",
                width: { xs: "100%", sm: 420 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backdropFilter: "blur(10px)",
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(36,26,14,0.6)"
                    : "rgba(255,255,255,0.6)"
              }}
            >
              <Search sx={{ mr: 1, color: "text.secondary" }} />

              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("artists.search")}
                variant="standard"
                fullWidth
                InputProps={{ disableUnderline: true }}
              />
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>

        {filtered.length === 0 ? (
          <Typography textAlign="center" color="text.secondary">
            {t("artists.no_results")}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
              gap: 3
            }}
          >

            {filtered.map((artist) => (
              <Box
                key={artist.id}
                onClick={() => navigate(`/artist/${artist.id}`)}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "0.3s",
                  border: "1px solid",
                  borderColor: "divider",
                  background: "background.paper",
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 4px 20px rgba(0,0,0,0.4)"
                      : "0 2px 10px rgba(0,0,0,0.03)",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 20px 50px rgba(0,0,0,0.6)"
                        : "0 16px 40px rgba(0,0,0,0.12)"
                  }
                }}
              >

                <Avatar
                  src={artist.photoURL}
                  sx={{
                    width: 90,
                    height: 90,
                    mx: "auto",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 10px 25px rgba(0,0,0,0.6)"
                        : "0 10px 25px rgba(0,0,0,0.15)"
                  }}
                >
                  {artist.displayName?.[0]?.toUpperCase()}
                </Avatar>

                <Typography fontWeight={800} mt={1.5}>
                  {artist.displayName}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {artist.email}
                </Typography>

                <Chip
                  icon={<Palette sx={{ fontSize: 16 }} />}
                  label={t("artists.artist")}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />

              </Box>
            ))}

          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Artists;