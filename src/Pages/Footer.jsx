import { Box, Container, Typography, Link, IconButton } from "@mui/material";
import { Instagram, Facebook, Twitter } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
const Footer = () => {
    const { t }     = useTranslation();
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: { xs: 5, md: 7 },
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Container maxWidth="lg">

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "2fr 1fr 1fr",
            },
            gap: 5,
          }}
        >

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ fontFamily: "'Playfair Display', serif" }}
            >
              Arty
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, lineHeight: 1.8, maxWidth: 320 }}
            >
            {t("footer.desc")}
            </Typography>
          </Box>

          <Box>
            <Typography fontWeight={700} mb={2}>
              {t("footer.explore")}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Link href="/" underline="hover" color="text.secondary">
               {t("nav.home")}
              </Link>
              <Link href="/gallery" underline="hover" color="text.secondary">
               {t("nav.gallery")}
              </Link>
              <Link href="/artists" underline="hover" color="text.secondary">
                {t("nav.artists")}
              </Link>
            </Box>
          </Box>

          {/* Social */}
          <Box>
            <Typography fontWeight={700} mb={2}>
              {t("footer.follow")}
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton sx={{ bgcolor: "action.hover" }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ bgcolor: "action.hover" }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ bgcolor: "action.hover" }}>
                <Twitter />
              </IconButton>
            </Box>
          </Box>

        </Box>

        <Box
          sx={{
            mt: 6,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Arty. {t("footer.rights")}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {t("footer.made_with_love")}
          </Typography>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;