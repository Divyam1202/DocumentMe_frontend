import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { logout } from "../firebase";
import "./Editor.css";

const Editor = ({ user }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [collaboratorEmail, setCollaboratorEmail] = useState("");
  const [showCollaboratorForm, setShowCollaboratorForm] = useState(false);
  const [savedFileId, setSavedFileId] = useState(null);
  const [fileLink, setFileLink] = useState("");
  const { id } = useParams(); // Get the document ID from URL

  useEffect(() => {
    // If we have an ID parameter, try to load that document
    if (id) {
      loadDocument(id);
    }
  }, [id]);

  const loadDocument = async (documentId) => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:5000/letters/${documentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle(response.data.title);
      setContent(response.data.content);
      setSavedFileId(response.data.googleDriveId || documentId);
      setFileLink(response.data.webViewLink);
      setMessage("Document loaded successfully");
    } catch (error) {
      console.error("Error loading document:", error);
      setMessage("❌ Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const saveLetter = async () => {
    const token = localStorage.getItem("token");

    // Check if user is logged in
    if (!token) {
      setMessage("❌ You must be logged in to save a letter.");
      return;
    }

    // Validate input
    if (!title.trim() || !content.trim()) {
      setMessage("⚠️ Title and content cannot be empty.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // If we're editing an existing document
      if (id) {
        const response = await axios.put(
          `http://localhost:5000/letters/${id}`,
          { title, content },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSavedFileId(response.data.fileId || id);
        setFileLink(response.data.webViewLink);
        setMessage("✅ Letter updated successfully!");
      } else {
        // Creating a new document
        const response = await axios.post(
          "http://localhost:5000/letters/save",
          { title, content },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSavedFileId(response.data.fileId);
        setFileLink(response.data.webViewLink);
        setMessage("✅ Letter saved successfully!");
      }
    } catch (error) {
      console.error("Error saving letter:", error);
      setMessage("❌ Failed to save letter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addCollaborator = async () => {
    const token = localStorage.getItem("token");

    // Check if user is logged in
    if (!token) {
      setMessage("❌ You must be logged in to add a collaborator.");
      return;
    }

    // Validate input
    if (!collaboratorEmail.trim()) {
      setMessage("⚠️ Collaborator email cannot be empty.");
      return;
    }

    if (!savedFileId && !id) {
      setMessage(
        "⚠️ Please save the letter first before adding collaborators."
      );
      return;
    }

    // Use either the saved file ID or the document ID from the URL
    const documentId = savedFileId || id;

    setLoading(true);
    setMessage("");

    try {
      console.log(
        `Adding collaborator ${collaboratorEmail} to document ${documentId}`
      );

      const response = await axios.post(
        "http://localhost:5000/letters/add-collaborator",
        {
          letterId: documentId,
          collaboratorEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Collaborator added successfully!");
      setCollaboratorEmail("");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      if (error.response) {
        setMessage(
          `❌ Failed to add collaborator: ${error.response.data.message}`
        );
      } else {
        setMessage("❌ Failed to add collaborator. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
    // We'll implement real-time collaboration later
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h2>{id ? "Edit Document" : "New Document"}</h2>
        <div className="profile">
          <span>{user.displayName}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>
      {message && <p className="message">{message}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title / File Name"
        disabled={loading}
        className="title-input"
      />
      <ReactQuill
        value={content}
        onChange={handleContentChange}
        placeholder="Write your letter..."
        modules={Editor.modules}
        formats={Editor.formats}
        readOnly={loading}
      />
      <button onClick={saveLetter} disabled={loading} className="save-button">
        {loading ? "Saving..." : id ? "Update" : "Save"}
      </button>

      {fileLink && (
        <div className="file-link">
          <h3>Google Drive Document</h3>
          <p>
            Your document has been saved to Google Drive.
            <a
              href={fileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="drive-link"
            >
              <span className="drive-icon">📄</span> Open Document in Google
              Drive
            </a>
          </p>
        </div>
      )}

      <button
        className="show-collaborator-form-button"
        onClick={() => setShowCollaboratorForm(!showCollaboratorForm)}
      >
        {showCollaboratorForm ? "Hide Collaborator Form" : "Add Collaborator"}
      </button>
      {showCollaboratorForm && (
        <div className="collaborator-section">
          <input
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            placeholder="Collaborator Email"
            disabled={loading}
          />
          <button onClick={addCollaborator} disabled={loading}>
            {loading ? "Adding..." : "Add Collaborator"}
          </button>
        </div>
      )}
    </div>
  );
};

Editor.modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
};

Editor.formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

export default Editor;
