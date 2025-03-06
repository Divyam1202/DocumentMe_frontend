import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

// Image paths
import richTextImage from "../components/img/richtxt.png";
import saveDraftsImage from "../components/img/save-drafts.png";
import userFriendlyImage from "../components/img/user-friendly.png";
import googleIconImage from "../components/img/google.png";

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Welcome to DocMe</h1>
        <p>Your ultimate letter editing and management tool.</p>
        <div className="features">
          <div className="feature">
            <img src={richTextImage} alt="Rich Text Editing" className="icon" />
            <p>Rich text editing with bold, italic, lists, and more.</p>
          </div>
          <div className="feature">
            <img src={saveDraftsImage} alt="Save Drafts" className="icon" />
            <p>Save drafts locally before uploading to Google Drive.</p>
          </div>
          <div className="feature">
            <img
              src={userFriendlyImage}
              alt="User-Friendly UI"
              className="icon"
            />
            <p>User-friendly UI with minimal distractions.</p>
          </div>
        </div>
        <Link to="/auth">
          <button className="login-button">
            Login with Google
            <img
              src={googleIconImage}
              alt="Google Icon"
              className="google-icon"
            />
          </button>
        </Link>
      </header>
    </div>
  );
};

export default LandingPage;
