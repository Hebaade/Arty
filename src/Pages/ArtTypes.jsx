import {
  Box, Container, Typography, Divider, Chip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
const artTypes = [
  {
    id: "painting",
    title: "Painting",
    arabicTitle: "الرسم بالألوان",
    description: "One of the oldest and most expressive art forms.",
    types: ["Oil", "Watercolor", "Acrylic"],
    artists: ["Leonardo da Vinci", "Van Gogh"],
  },
  {
    id: "digital",
    title: "Digital Art",
    arabicTitle: "الفن الرقمي",
    description: "Art created using digital tools.",
    types: ["3D", "Vector", "Pixel"],
    artists: ["Beeple", "FEWOCiOUS"],
  },
  {
    id: "photography",
    title: "Photography",
    arabicTitle: "التصوير",
    description: "Capturing moments using light.",
    types: ["Portrait", "Street", "Landscape"],
    artists: ["Ansel Adams", "Annie Leibovitz"],
  },
  {
    id: "illustration",
    title: "Illustration",
    arabicTitle: "الرسم التوضيحي",
    description: "Drawing to communicate ideas.",
    types: ["Editorial", "Fashion", "Concept"],
    artists: ["Mucha", "Rockwell"],
  },
];
const ArtTypes = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          py: 6,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" color="primary" gutterBottom>
           {t("about.title")}
          </Typography>
          <Typography color="text.secondary">
            {t("about.subtitle")}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
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

          {artTypes.map((type) => (

            <Box
              key={type.id}
              onClick={() => navigate(`/gallery?category=${type.title}`)}
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                p: 3,
                borderRadius: theme.shape.borderRadius * 2,
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                cursor: "pointer",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                },
              }}
            >

              <Box mb={2}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    color: theme.palette.primary.main,
                    mb: 0.5,
                  }}
                >
                  {type.title}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {type.arabicTitle}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2, lineHeight: 1.7 }}
              >
                {type.description}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 1, display: "block" }}
                >
                  STYLES
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {type.types.slice(0, 3).map((t) => (
                    <Chip key={t} label={t} size="small" />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, mb: 1, display: "block" }}
                >
                  ARTISTS
                </Typography>

                {type.artists.slice(0, 2).map((artist) => (
                  <Typography
                    key={artist}
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {artist}
                  </Typography>
                ))}
              </Box>

            </Box>

          ))}

        </Box>
      </Container>
    </Box>
  );
};

export default ArtTypes;