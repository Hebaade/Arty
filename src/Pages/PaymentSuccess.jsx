// Card Number : 4242 4242 4242 4242
// MM/YY       : 12/34
// CVC         : 123
// Name        : Any Name

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Container } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const [searchParams]        = useSearchParams();
  const navigate              = useNavigate();
  const { user }              = useAuth();
  const { t }                 = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const artworkId = searchParams.get("artworkId");
  const price     = searchParams.get("price");

  useEffect(() => {
    const savePurchase = async () => {
      if (!user || !artworkId) { setLoading(false); return; }
      try {
        const artworkDoc = await getDoc(doc(db, "artworks", artworkId));
        if (!artworkDoc.exists()) { setError("Artwork not found"); return; }
        const artwork = artworkDoc.data();

        await addDoc(collection(db, "purchases"), {
          artworkId,
          collectorId:   user.uid,
          collectorName: user.displayName  || "Anonymous",
          artistId:      artwork.artistId  || "",
          artistName:    artwork.artistName || "Unknown",
          title:         artwork.title      || "Untitled",
          imageUrl:      artwork.imageUrl   || "",
          category:      artwork.category   || "Other",
          price:         parseFloat(price)  || 0,
          purchasedAt:   serverTimestamp(),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    savePurchase();
  }, [user, artworkId]);

  return (
    <Container maxWidth="sm">
      <Box sx={{ textAlign: "center", mt: 10 }}>
        {loading ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography color="text.secondary">{t("payment.saving")}</Typography>
          </>
        ) : error ? (
          <>
            <Error sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
            <Typography color="error" mb={3}>{error}</Typography>
            <Button variant="contained" onClick={() => navigate("/")} sx={{ textTransform: "none" }}>Go Home</Button>
          </>
        ) : (
          <>
            <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
            <Typography variant="h4" fontWeight={700} mb={1}>{t("payment.success_title")}</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>{t("payment.success_desc")}</Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button variant="contained" onClick={() => navigate("/collector/my-collection")} sx={{ textTransform: "none" }}>
                {t("payment.view_collection")}
              </Button>
              <Button variant="outlined" onClick={() => navigate("/")} sx={{ textTransform: "none" }}>
                {t("payment.browse")}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default PaymentSuccess;