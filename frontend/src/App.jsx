import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import DetailPage from "./pages/DetailPage";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import ListingFormPage from "./pages/ListingFormPage";
import DashboardPage from "./pages/DashboardPage";
import InboxPage from "./pages/InboxPage";

export default function App() {
  return (
    <AuthProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/new" element={<ListingFormPage />} />
        <Route path="/listings/:id" element={<DetailPage />} />
        <Route path="/listings/:id/edit" element={<ListingFormPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/inbox" element={<InboxPage />} />
      </Routes>
    </AuthProvider>
  );
}
