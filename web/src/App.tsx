import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";
import { RequireAdmin } from "./auth/RequireAdmin";
import Layout from "./components/Layout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Register from "./pages/Register/index";
import Account from "./pages/Account";
import PetIndex from "./pages/Pets/index";
import EditPet from "./pages/Pets/EditPet";
import NewPet from "./pages/Pets/NewPet";
import ArticleIndex from "./pages/Articles/index";
import ArticlePage from "./pages/Articles/Article";
import AdminDashboard from "./pages/Admin/index";
import ArticleEditor from "./pages/Admin/ArticleEditor";
import Found from "./pages/Found";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            element={<Layout header={<Header />} footer={<Footer />} />}
          >
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Public page a pet's QR tag links to */}
            <Route path="/found/:code" element={<Found />} />

            {/* Authed Routes */}
            <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="/pets" element={<RequireAuth><PetIndex /></RequireAuth>} />
            <Route path="/pets/new" element={<RequireAuth><NewPet /></RequireAuth>} />
            <Route path="/pets/:id/edit" element={<RequireAuth><EditPet /></RequireAuth>} />
            <Route path="/articles" element={<ArticleIndex />} />
            <Route path="/articles/:slug" element={<ArticlePage />} />
            <Route path="/news" element={<Navigate to="/articles" replace />} />

            {/* Admin only */}
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/articles/new" element={<RequireAdmin><ArticleEditor /></RequireAdmin>} />
            <Route path="/admin/articles/:slug" element={<RequireAdmin><ArticleEditor /></RequireAdmin>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
