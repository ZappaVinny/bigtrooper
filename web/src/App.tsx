import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireAuth } from "./auth/RequireAuth";
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
import News from "./pages/News/index";

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

            {/* Authed Routes */}
            <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
            <Route path="/pets" element={<RequireAuth><PetIndex /></RequireAuth>} />
            <Route path="/pets/new" element={<RequireAuth><NewPet /></RequireAuth>} />
            <Route path="/pets/:id/edit" element={<RequireAuth><EditPet /></RequireAuth>} />
            <Route path="/news" element={<News />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
