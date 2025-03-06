import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Auth from "./components/Auth";
import Editor from "./components/Editor";
import SavedDocuments from "./components/SavedDocuments";
import GDriveFiles from "./components/GDriveFiles";
import Navigation from "./components/Navigation";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        {user && <Navigation />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth setUser={setUser} />} />
          <Route
            path="/editor"
            element={user ? <Editor user={user} /> : <LandingPage />}
          />
          <Route
            path="/editor/:id"
            element={user ? <Editor user={user} /> : <LandingPage />}
          />
          <Route
            path="/saved-documents"
            element={user ? <SavedDocuments /> : <LandingPage />}
          />
          <Route
            path="/google-drive"
            element={user ? <GDriveFiles /> : <LandingPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
