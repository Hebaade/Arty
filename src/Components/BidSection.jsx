import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { placeBid, fetchBids } from "../Store/bidsSlice";
import {
  Box, Typography, TextField, Button, Divider,
  Avatar, Alert, CircularProgress, Paper, Chip
} from "@mui/material";
import { Gavel } from "@mui/icons-material";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AuctionTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [ended, setEnded]       = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setEnded(true); setTimeLeft("Auction Ended"); return; }

      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        d > 0 ? `${d}d ${h}h ${m}m` :
        h > 0 ? `${h}h ${m}m ${s}s` :
        `${m}m ${s}s`
      );
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <Box sx={{
      display: "flex", alignItems: "center", gap: 1,
      p: 1.5, borderRadius: 1,
      bgcolor: ended ? "#FAECE7" : "#EAF3DE",
      border: "1px solid", borderColor: ended ? "#F5C6BE" : "#C3DFB0",
    }}>
      <Typography variant="body2" fontWeight={700} color={ended ? "error.main" : "success.main"}>
        ⏱️ {ended ? "Auction Ended" : `Ends in: ${timeLeft}`}
      </Typography>
    </Box>
  );
};

const BidSection = ({ artwork }) => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user, isCollector } = useAuth();
  const { bids, loading }     = useSelector((state) => state.bids);

  const [bidAmount, setBidAmount] = useState("");
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");

  const isEnded   = artwork.auctionEndTime && new Date(artwork.auctionEndTime) < new Date();
  const minBid    = (artwork.currentBid || artwork.startingBid || 0) + 1;
  const isWinning = artwork.currentBidderId === user?.uid;

  useEffect(() => {
    dispatch(fetchBids(artwork.id));
  }, [artwork.id, dispatch]);

  const handleBid = async () => {
    setError(""); setSuccess("");
    const amount = parseFloat(bidAmount);

    if (!user)        { navigate("/login"); return; }
    if (!isCollector) { setError("Only collectors can place bids"); return; }
    if (isEnded)      { setError("Auction has ended"); return; }
    if (isNaN(amount) || amount < minBid) {
      setError(`Minimum bid is $${minBid}`); return;
    }

    try {
      await dispatch(placeBid({ artworkId: artwork.id, amount, user })).unwrap();
      setSuccess(`Bid of $${amount} placed successfully!`);
      setBidAmount("");
    } catch (err) {
      setError(err);
    }
  };

  return (
    <Paper sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>

     
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Gavel sx={{ color: "primary.main", fontSize: 20 }} />
        <Typography fontWeight={700} color="primary">Live Auction</Typography>
      </Box>

     
      {artwork.auctionEndTime && (
        <Box sx={{ mb: 2 }}>
          <AuctionTimer endTime={artwork.auctionEndTime} />
        </Box>
      )}

      
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">Current Bid</Typography>
        <Typography variant="h4" fontWeight={800} color="primary">
          ${artwork.currentBid || artwork.startingBid}
        </Typography>
        {artwork.currentBidderName && (
          <Typography variant="caption" color="text.secondary">
            by {artwork.currentBidderName}
          </Typography>
        )}
      </Box>

      {isWinning && !isEnded && (
        <Chip label="🏆 You're winning!" color="success" size="small" sx={{ mb: 2 }} />
      )}

      {!isEnded && (
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            label={`Min bid: $${minBid}`}
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            inputProps={{ min: minBid, step: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleBid}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Gavel />}
            sx={{ textTransform: "none", whiteSpace: "nowrap" }}
          >
            Place Bid
          </Button>
        </Box>
      )}

      {error   && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {bids.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
            BID HISTORY
          </Typography>
          <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
            {bids.map((bid, i) => (
              <Box key={bid.id || i} sx={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", py: 0.8,
                borderBottom: i < bids.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "primary.main" }}>
                    {bid.bidderName?.[0]?.toUpperCase()}
                  </Avatar>
                  <Typography variant="caption">{bid.bidderName}</Typography>
                  {i === 0 && <Chip label="Highest" size="small" color="success" sx={{ fontSize: 9, height: 18 }} />}
                </Box>
                <Typography variant="caption" fontWeight={700} color="primary">
                  ${bid.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default BidSection;