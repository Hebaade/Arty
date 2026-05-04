import { useEffect, useState } from "react";
import {
  Container, Typography, Box, Avatar, Chip,
  CircularProgress, Alert, Divider
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { TrendingUp, AttachMoney, Palette } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const Earnings = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, "purchases"), where("artistId", "==", user.uid));
        const snap = await getDocs(q);
        setPurchases(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetch();
  }, [user]);

  const total = purchases.reduce((s, p) => s + (p.price || 0), 0);
  const sales = purchases.length;
  const avg = sales ? (total / sales).toFixed(2) : 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 5 }}>

      <Container maxWidth="lg">

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800}>
            {t("earnings.title")}
          </Typography>
          <Typography color="text.secondary">
            {t("earnings.subtitle")}
          </Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 2,
            mb: 5
          }}
        >

          <Box sx={tileStyle(theme)}>
            <AttachMoney sx={iconStyle} />
            <Box>
              <Typography variant="body2" color="text.secondary">
               {t("earnings.stats.total")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                ${total.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          <Box sx={tileStyle(theme)}>
            <TrendingUp sx={iconStyle} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t("earnings.stats.sales")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                {sales}
              </Typography>
            </Box>
          </Box>

          <Box sx={tileStyle(theme)}>
            <Palette sx={iconStyle} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t("earnings.stats.average")}
              </Typography>
              <Typography variant="h5" fontWeight={800}>
                ${avg}
              </Typography>
            </Box>
          </Box>

        </Box>

        <Typography variant="h6" fontWeight={700} mb={2}>
          {t("earnings.history")}
        </Typography>

        {purchases.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography fontSize={50}>🎨</Typography>
            <Typography color="text.secondary">
              {t("earnings.no_sales")}
            </Typography>
          </Box>
        ) : (

          <Box sx={{ display: "grid", gap: 1.5 }}>

            {purchases.map((p) => (
              <Box key={p.id} sx={rowStyle(theme)}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={p.imageUrl}
                    variant="rounded"
                    sx={{ width: 55, height: 55, borderRadius: 2 }}
                  />
                  <Box>
                    <Typography fontWeight={600}>
                      {p.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.collectorName || "Anonymous"}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {p.category && (
                    <Chip label={p.category} size="small" />
                  )}
                  <Typography fontWeight={800} color="primary">
                    +${p.price}
                  </Typography>
                </Box>

              </Box>
            ))}

          </Box>
        )}

      </Container>
    </Box>
  );
};

export default Earnings;



const tileStyle = (theme) => ({
  display: "flex",
  alignItems: "center",
  gap: 2,
  padding: "18px",
  borderRadius: 3,
  background: theme.palette.background.paper,
  border: "1px solid",
  borderColor: theme.palette.divider,
  transition: "0.25s",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
  }
});

const rowStyle = (theme) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: 3,
  background: theme.palette.background.paper,
  border: "1px solid",
  borderColor: theme.palette.divider,
  transition: "0.2s",
  "&:hover": {
    transform: "scale(1.01)",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
  }
});

const iconStyle = {
  fontSize: 34,
  opacity: 0.8,
  color: "primary.main"
};