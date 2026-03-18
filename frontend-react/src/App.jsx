import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UploadPage from "./pages/UploadPage";
import AdminPage from "./pages/AdminPage";
import { clearAuth, getUser } from "./api/auth";

function RequireAuth({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RequireAdmin({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/upload" replace />;
  }

  return children;
}

function LoginWrapper() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    const user = getUser();
    if (user?.isAdmin) {
      navigate("/admin");
      return;
    }
    navigate("/upload");
  };

  return (
    <LoginPage
      onLoginSuccess={handleLoginSuccess}
      goToSignup={() => navigate("/signup")}
    />
  );
}

function SignupWrapper() {
  const navigate = useNavigate();

  return <SignupPage goToLogin={() => navigate("/login")} />;
}

function UploadWrapper() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <UploadPage
      user={user}
      onLogout={handleLogout}
      goToUpload={() => navigate("/upload")}
      goToAdmin={() => navigate("/admin")}
    />
  );
}

function AdminWrapper() {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <AdminPage
      user={user}
      onLogout={handleLogout}
      goToUpload={() => navigate("/upload")}
      goToAdmin={() => navigate("/admin")}
    />
  );
}

function App() {
  const user = getUser();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.isAdmin ? "/admin" : "/upload"} replace /> : <LoginWrapper />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={user.isAdmin ? "/admin" : "/upload"} replace /> : <SignupWrapper />}
      />
      <Route
        path="/upload"
        element={
          <RequireAuth>
            <UploadWrapper />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminWrapper />
          </RequireAdmin>
        }
      />
      <Route
        path="*"
        element={<Navigate to={user ? (user.isAdmin ? "/admin" : "/upload") : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;