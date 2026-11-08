import Navbar from "./Navbar";
import { useAuth } from "../context/useAuth";
import LoadingComponent from "./LoadingComponent";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, loading, loggedOut } = useAuth();

  if (loading) return <LoadingComponent />;

  if (!isAuthenticated) {
    // After a deliberate logout the next sign-in, possibly another user, starts from the home page.
    return (
      <Navigate
        to="/login"
        replace
        state={loggedOut ? undefined : { from: location }}
      />
    );
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
