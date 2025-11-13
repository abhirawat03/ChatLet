// ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  if (!token) {
    // user not logged in, redirect to login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // if logged in, render the requested route
  return children;
}

export default ProtectedRoute;
