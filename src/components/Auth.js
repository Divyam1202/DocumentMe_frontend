import { useState, useEffect } from "react";
import { logout, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

const Auth = ({ setUser }) => {
  const [user, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLocalUser(currentUser);
      setUser(currentUser);

      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          localStorage.setItem("token", token);
          navigate("/editor"); // Redirect to the editor
        } catch (error) {
          console.error("Error retrieving Firebase token:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    const email = urlParams.get("email");

    if (token && userId && email) {
      setLoading(true);

      // Store the tokens in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userEmail", email);

      // Update user state
      setUser({ id: userId, email: email });

      // Redirect to editor
      navigate("/editor");
      setLoading(false);
    }
  }, [location, navigate, setUser]);

  // Request Google Drive Permissions
  const requestGoogleDriveAccess = async () => {
    try {
      const response = await axios.get("http://localhost:5000/auth/google/url");
      window.location.href = response.data.url; // Redirect user to Google Auth page
    } catch (error) {
      console.error("Error requesting Google Drive access:", error);
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {loading ? (
          <p>Logging in...</p>
        ) : user ? (
          <>
            <p>Welcome, {user.displayName}</p>
            <button className="auth-button" onClick={logout}>
              Logout
            </button>
            <button className="auth-button" onClick={requestGoogleDriveAccess}>
              Connect Google Drive
            </button>
          </>
        ) : (
          <>
            <h2>Welcome to DocMe</h2>
            <p>Sign in to access your documents</p>
            <button className="auth-button" onClick={handleLogin}>
              Sign in with Google
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
