import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Register from "./pages/Register/index";
import Account from "./pages/Account";
import PetIndex from "./pages/Pets/index";

import { User } from "./types/auth";

export default function App() {
  // const [user, setUser] = useState<User | null>(null);

  const testUser: User = {
    id: 1,
    name: "John",
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <Layout header={<Header user={testUser} />} footer={<Footer />} />
            // <Layout header={<Header />} footer={<Footer />} />
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Authed Routes */}
          <Route path="/account" element={<Account />} />
          <Route path="/pets" element={<PetIndex />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
