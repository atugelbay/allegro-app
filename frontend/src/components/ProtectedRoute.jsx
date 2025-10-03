import { Navigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return null; // можно спиннер
  return user ? children : <Navigate to="/login" replace />;
}
