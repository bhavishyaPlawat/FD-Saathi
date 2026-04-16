import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import HomePage from "./features/home/HomePage";
import ChatPage from "./features/chat/ChatPage";
import ComparePage from "./features/compare/ComparePage";
import HistoryPage from "./features/history/HistoryPage";
import ProfilePage from "./features/home/ProfilePage";
import EmergencyPage from "./features/emergency/EmergencyPage";
import OpenFDPage from "./features/fd/OpenFDPage";

export default function App() {
  return (
    <div translate="no">
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/open-fd" element={<OpenFDPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
