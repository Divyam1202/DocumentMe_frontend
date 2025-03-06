import React from "react";
import Editor from "../components/Editor";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2>Welcome to your Dashboard</h2>
      <Editor />
    </div>
  );
};

export default Dashboard;
