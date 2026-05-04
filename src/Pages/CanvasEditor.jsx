import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Typography, Button, Paper,
  Slider, TextField, MenuItem, Tooltip,
  IconButton, Divider, Alert, CircularProgress
} from "@mui/material";
import {
  Brush, Undo, Delete,
  Download, Save, Circle, SquareOutlined
} from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../Firebase/firestore";
import { useAuth } from "../Hooks/useAuth";
import { Canvas, PencilBrush, Circle as FabricCircle, Rect } from "fabric";
import { useTranslation } from "react-i18next";

const colors = [
  "#2C1810", "#8B5E3C", "#C49A6C", "#D4956A",
  "#e53935", "#1976d2", "#388e3c", "#f57c00",
  "#9c27b0", "#ffffff", "#000000", "#757575",
];

const categories = [
  "Painting", "Digital Art", "Illustration",
  "Abstract", "Portrait", "Landscape", "Other"
];

const CanvasEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const { t } = useTranslation();

  const [color, setColor] = useState("#2C1810");
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState("draw");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Digital Art");

  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#FDFAF5",
      isDrawingMode: true,
    });

    const brush = new PencilBrush(canvas);
    brush.color = "#2C1810";
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = brushSize;
  }, [color, brushSize]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.isDrawingMode = mode === "draw";
  }, [mode]);

  const handleUndo = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (objects.length) {
      canvas.remove(objects[objects.length - 1]);
      canvas.renderAll();
    }
  };

  const handleClear = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = "#FDFAF5";
    canvas.renderAll();
  };

  const addShape = (type) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setMode("select");

    const shape =
      type === "circle"
        ? new FabricCircle({ radius: 50, fill: color, left: 150, top: 100 })
        : new Rect({ width: 100, height: 100, fill: color, left: 150, top: 100 });

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
  };

  const handleDownload = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${title || "artwork"}.png`;
    link.href = canvas.toDataURL({ format: "png" });
    link.click();
  };

  const handleSave = async () => {
    if (!title || !price || !category) {
      setError("Please fill title, price and category");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const canvas = fabricRef.current;
      const dataURL = canvas.toDataURL({ format: "png" });

      const formData = new FormData();
      formData.append("file", dataURL);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();

      await addDoc(collection(db, "artworks"), {
        title,
        price: parseFloat(price),
        category,
        imageUrl: data.secure_url,
        artistId: user.uid,
        artistName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });

      navigate("/artist/my-artworks");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 3, overflowX: "hidden" }}>
      <Container maxWidth="xl">

        <Typography
          variant="h4"
          fontWeight={700}
          mb={3}
          sx={{ fontFamily: "'Playfair Display', serif" }}
        >
          🎨 {t("canvas.title")}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "220px 1fr"
            },
            gap: 3,
            alignItems: "start"
          }}
        >

          <Paper sx={{ p: 2, width: "100%" }}>

            <Typography variant="caption" fontWeight={700}>
              {t("canvas.sections.mode")}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                fullWidth
                size="small"
                variant={mode === "draw" ? "contained" : "outlined"}
                onClick={() => setMode("draw")}
              >
                {t("canvas.actions.draw")}
              </Button>

              <Button
                fullWidth
                size="small"
                variant={mode === "select" ? "contained" : "outlined"}
                onClick={() => setMode("select")}
              >
                {t("canvas.actions.select")}
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption">
              {t("canvas.sections.color")}
            </Typography>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {colors.map((c) => (
                <Box
                  key={c}
                  onClick={() => setColor(c)}
                  sx={{
                    width: 22,
                    height: 22,
                    bgcolor: c,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border: color === c ? "2px solid black" : "1px solid #ccc"
                  }}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="caption">
              {t("canvas.sections.brush")}: {brushSize}px
            </Typography>

            <Slider
              value={brushSize}
              onChange={(_, v) => setBrushSize(v)}
              min={1}
              max={50}
              size="small"
            />

            <Divider sx={{ my: 2 }} />

            <Button fullWidth onClick={handleUndo}>
              {t("canvas.actions.undo")}
            </Button>

            <Button fullWidth color="error" onClick={handleClear}>
              {t("canvas.actions.clear")}
            </Button>

            <Button fullWidth onClick={handleDownload}>
              {t("canvas.actions.download")}
            </Button>

          </Paper>

          <Box sx={{ width: "100%", overflow: "hidden" }}>

            <Paper sx={{ p: 1, mb: 2, display: "flex", justifyContent: "center" }}>
              <canvas ref={canvasRef} />
            </Paper>

            <Paper sx={{ p: 3 }}>

              <Typography variant="h6" fontWeight={700}>
                {t("canvas.form.title")}
              </Typography>

              {error && <Alert severity="error">{error}</Alert>}

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>

                <TextField
                  label={t("canvas.form.fields.title")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <TextField
                  label={t("canvas.form.fields.price")}
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

                <TextField
                  select
                  label={t("canvas.form.fields.category")}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Saving..." : t("canvas.actions.save")}
                </Button>

              </Box>

            </Paper>

          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CanvasEditor;