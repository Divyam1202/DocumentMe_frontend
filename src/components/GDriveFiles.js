import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GDriveFiles.css";

const GDriveFiles = () => {
  const [files, setFiles] = useState([]);
  const [folderContents, setFolderContents] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  useEffect(() => {
    fetchRootFiles();
  }, [lastRefresh]); // Re-fetch when lastRefresh changes

  const fetchRootFiles = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to view files");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/letters/drive-files",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add cache-busting parameter to prevent browser caching
          params: { _t: Date.now() },
        }
      );
      setFiles(response.data);
    } catch (err) {
      console.error("Error fetching Google Drive files:", err);
      setError("Failed to fetch Google Drive files");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolderContents = async (folderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Show loading state for this folder
      setFolderContents((prev) => ({
        ...prev,
        [folderId]: "loading",
      }));

      const response = await axios.get(
        `http://localhost:5000/letters/drive-files/${folderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // Add cache-busting parameter
          params: { _t: Date.now() },
        }
      );

      setFolderContents((prev) => ({
        ...prev,
        [folderId]: response.data,
      }));
    } catch (err) {
      console.error(`Error fetching folder ${folderId} contents:`, err);
      setFolderContents((prev) => ({
        ...prev,
        [folderId]: "error",
      }));
    }
  };

  const toggleFolder = async (folderId) => {
    // If folder is already expanded, collapse it
    if (expandedFolders[folderId]) {
      setExpandedFolders((prev) => ({
        ...prev,
        [folderId]: false,
      }));
      return;
    }

    // Otherwise expand it and fetch contents if needed
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: true,
    }));

    // Always refresh folder content when opening
    await fetchFolderContents(folderId);
  };

  const refreshFiles = () => {
    setLastRefresh(Date.now()); // This will trigger a re-fetch through useEffect
  };

  // Helper function to get icon for different file types
  const getFileIcon = (mimeType) => {
    if (mimeType === "application/vnd.google-apps.document") {
      return "📄";
    } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
      return "📊";
    } else if (mimeType === "application/vnd.google-apps.folder") {
      return "📁";
    } else if (mimeType.includes("image/")) {
      return "🖼️";
    } else if (mimeType.includes("text/plain")) {
      return "📝";
    } else {
      return "📎";
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderFileItem = (file, isNested = false) => {
    const isFolder = file.mimeType === "application/vnd.google-apps.folder";
    const isExpanded = expandedFolders[file.id];
    const folderContent = folderContents[file.id];

    return (
      <React.Fragment key={file.id}>
        <div className={`file-item ${isNested ? "nested-file" : ""}`}>
          <span className="file-icon">
            {isFolder ? (isExpanded ? "📂" : "📁") : getFileIcon(file.mimeType)}
          </span>

          <span
            className={`file-name ${isFolder ? "folder-name" : ""}`}
            onClick={() =>
              isFolder
                ? toggleFolder(file.id)
                : window.open(file.webViewLink, "_blank")
            }
          >
            {file.name}
          </span>

          <span className="file-type">{file.mimeType.split(".").pop()}</span>

          <span className="file-date">{formatDate(file.createdTime)}</span>

          <span className="file-actions">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="view-button"
              >
                Open
              </a>
            )}
          </span>
        </div>

        {/* Render folder contents if expanded */}
        {isFolder && isExpanded && (
          <div className="folder-contents">
            {folderContent === "loading" ? (
              <div className="loading-folder">Loading folder contents...</div>
            ) : folderContent === "error" ? (
              <div className="error-folder">Error loading folder contents</div>
            ) : folderContent && folderContent.length > 0 ? (
              folderContent.map((childFile) => renderFileItem(childFile, true))
            ) : (
              <div className="empty-folder">This folder is empty</div>
            )}
          </div>
        )}
      </React.Fragment>
    );
  };

  if (loading && files.length === 0) {
    return <div className="loading">Loading your Google Drive files...</div>;
  }

  if (error && files.length === 0) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="gdrive-files-container">
      <div className="files-header">
        <h2>Your Google Drive Files</h2>
        <button
          className="refresh-button"
          onClick={refreshFiles}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Files"}
        </button>
      </div>

      {files.length === 0 ? (
        <p>No files found in your Google Drive.</p>
      ) : (
        <div className="files-list">
          <div className="file-header">
            <span className="file-icon"></span>
            <span className="file-name">Name</span>
            <span className="file-type">Type</span>
            <span className="file-date">Created</span>
            <span className="file-actions">Actions</span>
          </div>
          {files.map((file) => renderFileItem(file))}
        </div>
      )}
    </div>
  );
};

export default GDriveFiles;
