import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./SavedDocuments.css";

// SVG Icons
const GoogleDriveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="icon"
  >
    <g>
      <path d="M50,10 L90,80 L10,80 Z" fill="#4285F4" />
      <path d="M10,80 L50,10 L50,90 Z" fill="#34A853" />
      <path d="M90,80 L50,10 L50,90 Z" fill="#FBBC05" />
      <path
        d="M50,90 L10,80 L90,80 Z"
        fill="none"
        stroke="#202124"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

const CollaboratorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    className="icon"
  >
    <g>
      <rect width="100" height="100" fill="#808080" />
      <circle cx="25" cy="20" r="8" fill="#D2B4DE" />
      <path
        d="M25,28 L25,60 M15,40 L35,40 M10,80 L25,60 L40,80"
        stroke="#202124"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M15,40 L25,50 L35,40"
        stroke="#202124"
        strokeWidth="2"
        fill="#ADD8E6"
      />
      <circle cx="75" cy="20" r="8" fill="#D2B4DE" />
      <path
        d="M75,28 L75,60 M65,40 L85,40 M60,80 L75,60 L90,80"
        stroke="#202124"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M65,40 L75,50 L85,40"
        stroke="#202124"
        strokeWidth="2"
        fill="#FFD700"
      />
      <path
        d="M35,45 L45,45 L45,55 L55,55 L55,65 L45,65 L45,55 L35,55 Z"
        fill="#FFD700"
        stroke="#202124"
        strokeWidth="1"
      />
      <path
        d="M55,45 L65,45 L65,55 L55,55 L55,65 L65,65 L65,55 L55,55 Z"
        fill="#D3D3D3"
        stroke="#202124"
        strokeWidth="1"
      />
      <path
        d="M45,50 A5,5 0 0 1 50,55 A5,5 0 0 1 45,60 Z"
        fill="#FFD700"
        stroke="#202124"
        strokeWidth="1"
      />
      <path
        d="M55,50 A5,5 0 0 0 50,55 A5,5 0 0 0 55,60 Z"
        fill="#D3D3D3"
        stroke="#202124"
        strokeWidth="1"
      />
    </g>
  </svg>
);

const SavedDocuments = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collaborators, setCollaborators] = useState({});

  const fetchLetters = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view saved letters.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/letters/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLetters(response.data);
    } catch (error) {
      console.error("Error fetching letters:", error);
      setError("Failed to fetch letters. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchCollaborators = async (letterId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/letters/${letterId}/collaborators`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCollaborators((prev) => ({
        ...prev,
        [letterId]: response.data,
      }));
    } catch (error) {
      console.error(
        `Error fetching collaborators for letter ${letterId}:`,
        error
      );
    }
  };

  const handleDelete = async (letterId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this document? This cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:5000/letters/${letterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLetters(letters.filter((letter) => letter._id !== letterId));
    } catch (error) {
      console.error("Error deleting letter:", error);
      alert("Failed to delete letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderCollaborators = (letterId) => {
    const letterCollaborators = collaborators[letterId];
    if (!letterCollaborators) {
      return null;
    }

    return (
      <div className="collaborators-list">
        {letterCollaborators.map((email) => (
          <div key={email} className="collaborator-email">
            {email}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="saved-documents-container">
      <h2>My Documents</h2>
      {letters.length === 0 ? (
        <p>No saved letters found.</p>
      ) : (
        <ul className="letters-list">
          {letters.map((letter) => (
            <li key={letter._id} className="letter-item">
              <h3>{letter.title}</h3>
              <div className="letter-actions">
                <Link to={`/editor/${letter._id}`} className="edit-link">
                  Edit
                </Link>
                {letter.webViewLink && (
                  <a
                    href={letter.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-link"
                  >
                    <GoogleDriveIcon />
                  </a>
                )}
                <button
                  onClick={() => fetchCollaborators(letter._id)}
                  className="collaborator-button"
                >
                  <CollaboratorIcon />
                </button>
                <button
                  onClick={() => handleDelete(letter._id)}
                  className="delete-button"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
              {collaborators[letter._id] && renderCollaborators(letter._id)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SavedDocuments;
