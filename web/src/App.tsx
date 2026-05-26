import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home/index";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout header={<Header />} footer={<Footer />} />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
