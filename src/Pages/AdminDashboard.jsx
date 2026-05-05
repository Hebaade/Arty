import { useEffect, useState } from "react";
import {
  Container, Typography, Box, Card, CardContent,
  Grid, CircularProgress, Alert, Chip,
  Avatar, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, Button, IconButton
} from "@mui/material";

import {
  People, Palette, ShoppingCart, AttachMoney,
  Delete
} from "@mui/icons-material";

import {
  collection, getDocs, deleteDoc, doc, query, orderBy
} from "firebase/firestore";

import { db } from "../Firebase/firestore";
import { useTranslation } from "react-i18next";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("overview");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [u, a, p] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(query(collection(db, "artworks"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "purchases")),
        ]);

        setUsers(u.docs.map(d => ({ id: d.id, ...d.data() })));
        setArtworks(a.docs.map(d => ({ id: d.id, ...d.data() })));
        setPurchases(p.docs.map(d => ({ id: d.id, ...d.data() })));

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totalRevenue = purchases.reduce((s, p) => s + (p.price || 0), 0);

  const handleDelete = async (col, id, setter) => {
    try {
      await deleteDoc(doc(db, col, id));
      setter(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const tabs = ["overview", "users", "artworks", "sales"];

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 }, overflowX: "hidden" }}>

      <Typography variant="h4" fontWeight={800} mb={3}>
        {t("dashboard.title")}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: "flex", gap: 1, mb: 4, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <Button
            key={t}
            onClick={() => setTab(t)}
            variant={tab === t ? "contained" : "outlined"}
            sx={{ textTransform: "capitalize", borderRadius: 2 }}
          >
            {t}
          </Button>
        ))}
      </Box>

      {tab === "overview" && (
        <Grid container spacing={2}>
          <StatCard title={t("dashboard.users")} value={users.length} icon={<People />} />
          <StatCard title={t("dashboard.artworks")} value={artworks.length} icon={<Palette />} />
          <StatCard title={t("dashboard.sales")} value={purchases.length} icon={<ShoppingCart />} />
          <StatCard title={t("dashboard.revenue")} value={`$${totalRevenue}`} icon={<AttachMoney />} />
        </Grid>
      )}

      {tab === "users" && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("dashboard.user")}</TableCell>
                <TableCell>{t("dashboard.email")}</TableCell>
                <TableCell>{t("dashboard.role")}</TableCell>
                <TableCell align="right">{t("dashboard.action")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar src={u.photoURL} sx={{ width: 32, height: 32 }}>
                        {u.displayName?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography noWrap>{u.displayName}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography noWrap>{u.email}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip size="small" label={u.role} />
                  </TableCell>

                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete("users", u.id, setUsers)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      )}

      {tab === "artworks" && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("dashboard.artwork")}</TableCell>
                <TableCell>{t("dashboard.artist")}</TableCell>
                <TableCell>{t("dashboard.img")}</TableCell>
                <TableCell>{t("dashboard.category")}</TableCell>
                <TableCell>{t("dashboard.price")}</TableCell>
                <TableCell align="right">{t("dashboard.action")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {artworks.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell><Typography noWrap>{a.title}</Typography></TableCell>
                  <TableCell><Typography noWrap>{a.artistName}</Typography></TableCell>
                  <TableCell><Avatar variant="rounded" src={a.imageUrl} sx={{ width: 40, height: 40 }} /></TableCell>
                  <TableCell><Chip size="small" label={a.category || "N/A"} /></TableCell>
                  <TableCell>${a.price}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete("artworks", a.id, setArtworks)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      )}

      {tab === "sales" && (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("dashboard.artwork")}</TableCell>
                <TableCell>{t("dashboard.buyer")}</TableCell>
                <TableCell>{t("dashboard.artist")}</TableCell>
                <TableCell>{t("dashboard.price")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {purchases.map(p => (
                <TableRow key={p.id} hover>
                  <TableCell><Typography noWrap>{p.title}</Typography></TableCell>
                  <TableCell><Typography noWrap>{p.collectorName}</Typography></TableCell>
                  <TableCell><Typography noWrap>{p.artistName}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>
                    ${p.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      )}

    </Container>
  );
};

const StatCard = ({ title, value, icon }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Card sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Box sx={{ color: "primary.main" }}>
            {icon}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" fontWeight={900}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Grid>
);

export default AdminDashboard;