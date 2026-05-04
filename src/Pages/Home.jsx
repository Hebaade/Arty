import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtworks } from "../Store/artWorksSlice";

import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Skeleton,
  Container,
  Button,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";



const HeroSlider = () => {
  const navigate = useNavigate();
  const { t }     = useTranslation();
  const slides = [
    {
      title: "Discover Unique Artworks",
      desc: "Explore digital masterpieces from artists around the world",
      img: "/artur-matosyan-4YWUMaftmag-unsplash.jpg"
    },
    {
      title: "Buy & Collect Art",
      desc: "Own exclusive pieces and build your collection",
      img: "/serg-bataev-pWEFjiRkjDU-unsplash.jpg"
    },
    {
      title: "Support Artists",
      desc: "Empower creators and support their journey",
      img: "/zalfa-imani-1xp5VxvyKL0-unsplash.jpg"
    }
  ];

  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      autoplay={{ delay: 4000 }}
      pagination={{ clickable: true }}
      effect="fade"
      loop
    >
      {slides.map((s, i) => (
        <SwiperSlide key={i}>
          <Box
            sx={{
              height: "80vh",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              textAlign: "center",
              backgroundImage: `url(${s.img})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(0,0,0,0.6)"
              }}
            />

            <Box sx={{ zIndex: 2, maxWidth: 700, px: 2 }}>
              <Typography variant="h3" fontWeight={800}>
                {s.title}
              </Typography>

              <Typography sx={{ mt: 2, opacity: 0.8 }}>
                {s.desc}
              </Typography>

              <Button
                variant="contained"
                sx={{ mt: 3, borderRadius: 3 }}
                onClick={() => navigate("/gallery")}
              >
               {t("home.explore")}
              </Button>
            </Box>
          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};



const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { artworks, loading, error } = useSelector((state) => state.artworks);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchArtworks());
  }, [dispatch]);

  const featuredArtworks = artworks.slice(0, 4);

  if (error)
    return (
      <Container sx={{ py: 6 }}>
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      </Container>
    );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      <HeroSlider />
  <Box
  sx={{
    py: 10,
    px: 2,
    background:
      "linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0))",
  }}
>
  <Container maxWidth="md">

    <Box
      sx={{
        textAlign: "center",
        p: { xs: 3, md: 6 },
        borderRadius: 4,
        backgroundColor: "background.paper",
        boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >

      <Typography
        variant="h4"
        fontWeight={800}
        sx={{
          mb: 3,
          fontFamily: "'Playfair Display', serif",
          color: "primary.main",
        }}
      >
        {t("home.our_mission")}
      </Typography>

      <Box
        sx={{
          width: 60,
          height: 3,
          bgcolor: "primary.main",
          mx: "auto",
          mb: 3,
          borderRadius: 10,
        }}
      />

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          lineHeight: 1.9,
          fontSize: "1.05rem",
          maxWidth: 650,
          mx: "auto",
        }}
      >
        {t("home.mission_desc")}
      </Typography>

    </Box>

  </Container>
</Box>
      <Container maxWidth="xl">

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            mt: 5
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {t("home.top")}
          </Typography>

          <Button
            variant="outlined"
            onClick={() => navigate("/gallery")}
            sx={{ borderRadius: 3 }}
          >
            {t("home.view gallery")}
          </Button>
        </Box>

        {loading ? (
          <Box sx={gridStyle}>
            {[...Array(5)].map((_, i) => (
              <Box key={i}>
                <Skeleton variant="rectangular" height={260} />
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={gridStyle}>
            {featuredArtworks.map((artwork) => (
              <Card
                key={artwork.id}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "0.3s",

                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow:
                      theme.palette.mode === "dark"
                        ? "0 20px 40px rgba(0,0,0,0.6)"
                        : "0 18px 40px rgba(0,0,0,0.12)"
                  }
                }}
              >
                <CardActionArea
                  onClick={() => navigate(`/artwork/${artwork.id}`)}
                >
                  <Box
                    component="img"
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    sx={{
                      height: 260,
                      width: "100%",
                      objectFit: "cover",
                      transition: "0.5s",
                      "&:hover": { transform: "scale(1.08)" }
                    }}
                  />

                  <CardContent>
                    <Typography fontWeight={700} noWrap>
                      {artwork.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {t("home.by")} {artwork.artistName}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 2
                      }}
                    >
                      <Typography fontWeight={800} color="primary">
                        ${artwork.price}
                      </Typography>

                      {artwork.category && (
                        <Chip
                          label={artwork.category}
                          size="small"
                          sx={{
                            bgcolor:
                              theme.palette.mode === "dark"
                                ? "rgba(196,154,108,0.15)"
                                : "rgba(139,94,60,0.1)"
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Container>
        <Box
      sx={{
        py: 10,
        px: 2,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(0,0,0,0))",
      }}
    >
      <Container maxWidth="md">

        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: 5,
            backgroundColor: "background.paper",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >

          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              mb: 2,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {t("home.call_to_action")}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
           {t("home.call_desc")}
          </Typography>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
            >
              {t("home.join")}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/gallery")}
            >
              {t("home.explore_art")}
            </Button>
          </Box>

        </Box>

      </Container>
    </Box>
    </Box>
  );
};

export default Home;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 5,
  mb: 6
};