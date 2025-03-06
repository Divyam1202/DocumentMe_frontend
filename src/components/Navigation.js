import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";

const Navigation = () => {
  return (
    <nav className="main-navigation">
      <ul>
        <li>
          <Link to="/editor">New Document</Link>
        </li>
        <li>
          <Link to="/saved-documents">My Documents</Link>
        </li>
        <li>
          <Link to="/google-drive">Google Drive Files</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
