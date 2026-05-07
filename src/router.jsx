import { Routes, Route, Navigate, Outlet
} from "react-router-dom";
import { useAuth
} from "./Hooks/useAuth";
import { CircularProgress, Box
} from "@mui/material";
import Login          from "./Pages/Login";
import Register       from "./Pages/Register";
import ChooseRole     from "./Pages/ChooseRole";
import Navbar         from "./Pages/Navbar";
import Footer         from "./Pages/Footer";
import Home           from "./Pages/Home";
import UploadArtwork  from "./Pages/UploadArtwork";
import EditArtwork  from "./Pages/EditArtwork";
import ArtworkDetail  from "./Pages/ArtworkDetail";
import MyArtworks     from "./Pages/MyArtworks";
import MyCollection   from "./Pages/MyCollection";
import PaymentSuccess from "./Pages/PaymentSuccess";
import Earnings       from "./Pages/Earnings";
import AdminDashboard from "./Pages/AdminDashboard";
import Gallery  from "./Pages/Gallery";
import ArtTypes from "./Pages/ArtTypes";
import Favorites from "./Pages/Favorites";
import Artists from "./Pages/Artists";
import ArtistProfile from "./Pages/ArtistProfile";
import CanvasEditor from "./Pages/CanvasEditor";
import UserProfile from "./Pages/UserProfile";

const ProtectedRoute = ({ allowedRoles
}) => {
  const { isLoggedIn, role, loading
  } = useAuth();

  if (loading) return (
    <Box sx={
    { display: "flex", justifyContent: "center", mt: 10
    }
  }>
      <CircularProgress />
    </Box>
  );

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!role) return <Navigate to="/choose-role" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
};

const MainLayout = () => (
  <Box
    sx={
  {
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
  }
}
  >
    <Navbar />

    <Box sx={
  { flex: 1
  }
}>
      <Outlet />
    </Box>

    <Footer />
  </Box>
);

const AppRouter = () => {
 const { isLoggedIn, role
  } = useAuth();

  return (
    <Routes>

        <Route path="/login" element={
        isLoggedIn
          ? (role ? <Navigate to="/" /> : <Navigate to="/choose-role" />)
          : <Login />
  } />
      <Route path="/register" element={
        isLoggedIn
          ? (role ? <Navigate to="/" /> : <Navigate to="/choose-role" />)
          : <Register />
  } />
     
      <Route element={<MainLayout />
  }>
        <Route path="/"            element={<Home />
  } />
        <Route path="/choose-role" element={<ChooseRole />
  } />
        <Route path="/artwork/:id" element={<ArtworkDetail />
  } />
        <Route path="/payment-success" element={<PaymentSuccess />
  } />
        <Route path="/artists" element={<Artists />
  } />
<Route path="/gallery"   element={<Gallery />
  } />
<Route path="/art-types" element={<ArtTypes />
  } />
<Route path="/artist/:artistId" element={<ArtistProfile />
  } />
    
        <Route element={<ProtectedRoute allowedRoles={
      [
        "admin"
      ]
    } />
  }>
          <Route path="/admin" element={<AdminDashboard />
  } />
        </Route>

     
        
        <Route element={<ProtectedRoute allowedRoles={
      [
        "artist"
      ]
    } />
  }>
          <Route path="/artist/upload"      element={<UploadArtwork />
  } />
          <Route path="/artist/my-artworks" element={<MyArtworks />
  } />
          <Route path="/artist/earnings"    element={<Earnings />
  } />
          <Route path="/edit-artwork/:id" element={<EditArtwork />
  } />
          <Route path="/artist/canvas" element={<CanvasEditor />
  } />
  
        </Route>

        <Route element={<ProtectedRoute allowedRoles={
      [
        "collector"
      ]
    } />
  }>
          <Route path="/collector/my-collection" element={<MyCollection />
  } />
          <Route path="/collector/favorites"     element={<Favorites />
  } />
        </Route>
<Route element={<ProtectedRoute allowedRoles={
      [
        "admin",
        "artist",
        "collector"
      ]
    } />
  }>
  <Route path="/profile" element={<UserProfile />
  } />
</Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />
  } />

    </Routes>
  );
};

export default AppRouter;